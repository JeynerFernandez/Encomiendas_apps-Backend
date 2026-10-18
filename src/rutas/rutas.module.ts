import {
  Module,
} from '@nestjs/common';
import {
  TypeOrmModule,
} from '@nestjs/typeorm';
import { Ruta } from './ruta.entity.js';
import { RutaSede } from './ruta-sede.entity.js';
import { Sede } from '../sedes/sede.entity.js';
import { RutasService } from './rutas.service.js';
import { RutasController } from './rutas.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ruta,
      RutaSede,
      Sede,
    ]),
  ],
  providers: [
    RutasService,
  ],
  controllers: [
    RutasController,
  ],
  exports: [
    RutasService,
    TypeOrmModule,
  ],
})
export class RutasModule {}