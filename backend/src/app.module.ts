import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TrekkingPlacesModule } from './modules/trekking-places/trekking-places.module';
import { HealthModule } from './modules/health/health.module';
import { configuration } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    TrekkingPlacesModule,
    HealthModule,
  ],
})
export class AppModule {}
