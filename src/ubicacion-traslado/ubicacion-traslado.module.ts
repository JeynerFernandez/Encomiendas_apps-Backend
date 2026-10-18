import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  UbicacionTraslado,
} from './ubicacion-traslado.entity.js';

import {
  Traslado,
} from '../traslados/traslado.entity.js';

import {
  UbicacionTrasladoService,
} from './ubicacion-traslado.service.js';

import {
  UbicacionTrasladoController,
} from './ubicacion-traslado.controller.js';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      UbicacionTraslado,
      Traslado,
    ]),

  ],

  providers: [
    UbicacionTrasladoService,
  ],

  controllers: [
    UbicacionTrasladoController,
  ],

  exports: [
    UbicacionTrasladoService,
    TypeOrmModule,
  ],

})
export class UbicacionTrasladoModule {}