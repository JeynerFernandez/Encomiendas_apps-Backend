import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Traslado,
} from './traslado.entity.js';

import {
  Ruta,
} from '../rutas/ruta.entity.js';

import {
  Vehiculo,
} from '../vehiculos/vehiculo.entity.js';

import {
  User,
} from '../users/user.entity.js';

import {
  TrasladoEncomienda,
} from '../traslado-encomienda/traslado-encomienda.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  HistorialEncomiendaModule,
} from '../historial-encomienda/historial-encomienda.module.js';

import {
  TrasladosService,
} from './traslados.service.js';

import {
  TrasladosController,
} from './traslados.controller.js';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      Traslado,
      Ruta,
      Vehiculo,
      User,
      TrasladoEncomienda,
      Encomienda,
    ]),

    HistorialEncomiendaModule,

  ],

  providers: [
    TrasladosService,
  ],

  controllers: [
    TrasladosController,
  ],

  exports: [
    TrasladosService,
    TypeOrmModule,
  ],

})
export class TrasladosModule {}