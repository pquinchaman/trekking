import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TrekkingPlaceResponseDto } from '../dto/trekking-place-response.dto';
import { DifficultyLevel } from '../dto/search-trekking-places.dto';

export interface AISearchParams {
  query: string;
  userPreferences?: {
    difficulty?: string;
    maxDistance?: number;
    features?: string[]; // ej: ["sombra", "agua", "vistas"]
  };
}

export interface AIRecommendation {
  reasoning: string;
  searchParams: {
    name?: string;
    lat?: number;
    lon?: number;
    radius?: number;
    difficulty?: DifficultyLevel;
  };
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly gemini: GoogleGenerativeAI | null;
  private readonly geminiModel: string;
  private readonly geminiEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    // Configuración de Gemini
    const geminiApiKey = this.configService.get<string>('gemini.apiKey');
    this.geminiModel = this.configService.get<string>('gemini.model') || 'gemini-2.5-flash';
    this.geminiEnabled = !!geminiApiKey;

    if (this.geminiEnabled) {
      this.gemini = new GoogleGenerativeAI(geminiApiKey);
      this.logger.log('Google Gemini habilitado');
    } else {
      this.logger.warn('Google Gemini API Key no configurada.');
      this.gemini = null;
    }
  }

  /**
   * Verifica si el proveedor de IA está disponible
   */
  isAvailable(): boolean {
    return this.geminiEnabled;
  }

  /**
   * Obtiene modelos alternativos a probar si el principal falla
   * Ordenados por preferencia: primero los más recientes y disponibles
   */
  private getAlternativeGeminiModels(): string[] {
    // Modelos disponibles en orden de preferencia (más estables primero)
    return [
      'gemini-2.5-flash',      // Modelo balanceado recomendado
      'gemini-2.5-pro',        // Modelo más potente para tareas complejas
      'gemini-2.5-flash-lite', // Más rápido y económico
      'gemini-3-flash-preview', // Versión preview más reciente
      'gemini-3-pro-preview',   // Versión preview más potente
    ];
  }

  /**
   * Procesa consulta con Gemini
   * Intenta con el modelo configurado, y si falla, intenta con modelos alternativos
   */
  private async processWithGemini(
    systemPrompt: string,
    userMessage: string,
  ): Promise<string> {
    if (!this.geminiEnabled || !this.gemini) {
      throw new Error('Gemini no está disponible');
    }

    // Modelos alternativos a probar si el principal falla
    const alternativeModels = this.getAlternativeGeminiModels();
    const modelsToTry = [this.geminiModel, ...alternativeModels.filter(m => m !== this.geminiModel)];

    // Gemini usa un formato diferente, combinamos system y user en el prompt
    const fullPrompt = `${systemPrompt}\n\n${userMessage}`;

    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      try {
        this.logger.debug(`[Gemini] Intentando con modelo: ${modelName}`);
        const model = this.gemini.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();
        if (!text) {
          throw new Error('No se recibió respuesta de Gemini');
        }

        if (modelName !== this.geminiModel) {
          this.logger.warn(`[Gemini] Modelo ${this.geminiModel} no disponible, usando ${modelName} exitosamente`);
        }

        return text;
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || String(error) || '';
        const errorString = errorMessage.toLowerCase();
        
        // Detectar errores de modelo no encontrado o no soportado
        const isModelNotFound = 
          errorString.includes('404') || 
          errorString.includes('not found') || 
          errorString.includes('not supported') ||
          (errorString.includes('models/') && errorString.includes('is not found')) ||
          errorString.includes('is not found for api version');
        
        const currentIndex = modelsToTry.indexOf(modelName);
        const isLastModel = currentIndex === modelsToTry.length - 1;
        
        if (isModelNotFound && !isLastModel) {
          this.logger.warn(`[Gemini] Modelo ${modelName} no disponible (${errorMessage}), intentando con siguiente modelo...`);
          continue;
        }
        
        // Si es el último modelo o no es error de modelo no encontrado, lanzar el error
        if (isLastModel) {
          this.logger.error(`[Gemini] Todos los modelos fallaron. Último error: ${errorMessage}`);
        }
        throw error;
      }
    }

    throw lastError || new Error('No se pudo procesar con ningún modelo de Gemini');
  }

  /**
   * Genera recomendaciones con Gemini usando modelos alternativos si es necesario
   */
  private async generateRecommendationsWithGemini(prompt: string): Promise<string> {
    if (!this.geminiEnabled || !this.gemini) {
      throw new Error('Gemini no está disponible');
    }

    const alternativeModels = this.getAlternativeGeminiModels();
    const modelsToTry = [this.geminiModel, ...alternativeModels.filter(m => m !== this.geminiModel)];

    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      try {
        this.logger.debug(`[Gemini] Generando recomendaciones con modelo: ${modelName}`);
        const model = this.gemini.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        });
        const result = await model.generateContent(prompt);
        const recommendation = result.response.text().trim();
        if (recommendation) {
          if (modelName !== this.geminiModel) {
            this.logger.warn(`[Gemini] Modelo ${this.geminiModel} no disponible, usando ${modelName} exitosamente`);
          }
          this.logger.debug('[Gemini] Recomendación generada exitosamente');
          return recommendation;
        }
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || String(error) || '';
        const errorString = errorMessage.toLowerCase();
        
        // Detectar errores de modelo no encontrado o no soportado
        const isModelNotFound = 
          errorString.includes('404') || 
          errorString.includes('not found') || 
          errorString.includes('not supported') ||
          errorString.includes('models/') && errorString.includes('is not found') ||
          errorString.includes('is not found for api version');
        
        const currentIndex = modelsToTry.indexOf(modelName);
        const isLastModel = currentIndex === modelsToTry.length - 1;
        
        if (isModelNotFound && !isLastModel) {
          this.logger.warn(`[Gemini] Modelo ${modelName} no disponible (${errorMessage}), intentando con siguiente modelo...`);
          continue;
        }
        
        // Si es el último modelo o no es error de modelo no encontrado, lanzar el error
        if (isLastModel) {
          this.logger.error(`[Gemini] Todos los modelos fallaron. Último error: ${errorMessage}`);
        }
        throw error;
      }
    }

    throw lastError || new Error('No se pudo generar recomendaciones con ningún modelo de Gemini');
  }

  /**
   * Procesa una consulta en lenguaje natural usando Gemini
   */
  async processNaturalLanguageQuery(
    params: AISearchParams,
  ): Promise<AIRecommendation> {
    if (!this.isAvailable()) {
      throw new HttpException(
        'El servicio de IA no está configurado. Configure GEMINI_API_KEY.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const systemPrompt = `Eres un asistente experto en trekking y senderismo en Chile. 
Tu tarea es analizar consultas de usuarios y extraer parámetros de búsqueda estructurados.

Contexto:
- Estamos buscando lugares de trekking/senderismo en Chile
- Las coordenadas de Chile son: latitud -56.0 a -17.5, longitud -75.6 a -66.4
- Niveles de dificultad: easy, moderate, hard, expert

Instrucciones:
1. Identifica el nombre del lugar mencionado (si existe)
2. Identifica el nivel de dificultad mencionado o preferido
3. Identifica características especiales mencionadas (sombra, agua, vistas, etc.)
4. Si se menciona una distancia o "cerca de", intenta inferir un radio de búsqueda
5. Si se menciona una ciudad o región, úsala como referencia de ubicación

Responde SOLO con un JSON válido en este formato:
{
  "reasoning": "Breve explicación de cómo interpretaste la consulta",
  "searchParams": {
    "name": "nombre del lugar si se mencionó",
    "lat": número solo si puedes inferir coordenadas específicas,
    "lon": número solo si puedes inferir coordenadas específicas,
    "radius": número en km (default: 50),
    "difficulty": "easy|moderate|hard|expert" solo si se mencionó
  }
}`;

    const userMessage = `Consulta del usuario: "${params.query}"
${params.userPreferences ? `Preferencias: ${JSON.stringify(params.userPreferences)}` : ''}

Analiza esta consulta y extrae los parámetros de búsqueda.`;

    // Procesar con Gemini
    if (this.geminiEnabled && this.gemini) {
      try {
        this.logger.debug(`[Gemini] Procesando consulta: ${params.query}`);
        const content = await this.processWithGemini(systemPrompt, userMessage);
        const recommendation = JSON.parse(content) as AIRecommendation;

        this.logger.debug(
          `[Gemini] Procesó consulta exitosamente. Parámetros: ${JSON.stringify(recommendation.searchParams)}`,
        );

        return recommendation;
      } catch (error) {
        this.logger.error(
          `[Gemini] Error al procesar consulta: ${error.message}`,
          error.stack,
        );
        throw new HttpException(
          `Error al procesar la consulta con Gemini: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    throw new HttpException(
      'El servicio de IA no está disponible',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  /**
   * Genera recomendaciones personalizadas usando Gemini
   */
  async generateRecommendations(
    places: TrekkingPlaceResponseDto[],
    userQuery: string,
  ): Promise<string> {
    if (!this.isAvailable()) {
      return '';
    }

    if (places.length === 0) {
      return 'No se encontraron lugares que coincidan con tu búsqueda.';
    }

    const placesSummary = places
      .slice(0, 10) // Limitar a 10 para no exceder tokens
      .map(
        (place) =>
          `- ${place.name} (${place.type}): ${place.description || 'Sin descripción'}. Dificultad: ${place.difficulty || 'No especificada'}. Distancia: ${place.distance || 'N/A'} km`,
      )
      .join('\n');

    const prompt = `Basándote en los siguientes lugares de trekking encontrados en Chile, genera una recomendación breve y útil para el usuario.

Consulta original: "${userQuery}"

Lugares encontrados:
${placesSummary}

Genera una recomendación de 2-3 oraciones que:
1. Resuma los mejores lugares encontrados
2. Mencione características destacadas
3. Dé consejos útiles si es relevante

Responde solo con el texto de la recomendación, sin formato adicional.`;

    // Generar recomendaciones con Gemini
    if (this.geminiEnabled && this.gemini) {
      try {
        this.logger.debug(`[Gemini] Generando recomendaciones para ${places.length} lugares`);
        const recommendation = await this.generateRecommendationsWithGemini(prompt);
        if (recommendation) {
          return recommendation;
        }
      } catch (error) {
        this.logger.warn(
          `[Gemini] Error al generar recomendaciones: ${error.message}. Continuando sin recomendaciones.`,
        );
      }
    }

    // Si todo falla, retornar string vacío (no lanzar error)
    return '';
  }
}
