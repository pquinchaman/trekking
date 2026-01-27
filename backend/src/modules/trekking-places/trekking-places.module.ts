import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TrekkingPlacesController } from './trekking-places.controller';
import { TrekkingPlacesService } from './trekking-places.service';
import { OverpassService } from './services/overpass.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [TrekkingPlacesController],
  providers: [TrekkingPlacesService, OverpassService],
  exports: [TrekkingPlacesService],
})
export class TrekkingPlacesModule {}
