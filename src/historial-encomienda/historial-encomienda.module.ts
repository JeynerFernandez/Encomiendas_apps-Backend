import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  HistorialEncomienda,
} from './historial-encomienda.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  HistorialEncomiendaService,
} from './historial-encomienda.service.js';

import {
  HistorialEncomiendaController,
} from './historial-encomienda.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HistorialEncomienda,
      Encomienda,
    ]),
  ],

  providers: [
    HistorialEncomiendaService,
  ],

  controllers: [
    HistorialEncomiendaController,
  ],

  exports: [
    HistorialEncomiendaService,
    TypeOrmModule,
  ],
})
export class HistorialEncomiendaModule {}