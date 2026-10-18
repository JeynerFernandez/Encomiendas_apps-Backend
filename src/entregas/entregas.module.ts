import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Entrega,
} from './entrega.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  User,
} from '../users/user.entity.js';

import {
  PagosModule,
} from '../pagos/pagos.module.js';

import {
  HistorialEncomiendaModule,
} from '../historial-encomienda/historial-encomienda.module.js';

import {
  EntregasService,
} from './entregas.service.js';

import {
  EntregasController,
} from './entregas.controller.js';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      Entrega,
      Encomienda,
      User,
    ]),

    PagosModule,

    HistorialEncomiendaModule,

  ],

  providers: [
    EntregasService,
  ],

  controllers: [
    EntregasController,
  ],

  exports: [
    EntregasService,
    TypeOrmModule,
  ],

})
export class EntregasModule {}