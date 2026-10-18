import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  TrasladoEncomienda,
} from './traslado-encomienda.entity.js';

import {
  Traslado,
} from '../traslados/traslado.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  Sede,
} from '../sedes/sede.entity.js';

import {
  TrasladoEncomiendaService,
} from './traslado-encomienda.service.js';

import {
  TrasladoEncomiendaController,
} from './traslado-encomienda.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrasladoEncomienda,
      Traslado,
      Encomienda,
      Sede,
    ]),
  ],

  providers: [
    TrasladoEncomiendaService,
  ],

  controllers: [
    TrasladoEncomiendaController,
  ],

  exports: [
    TrasladoEncomiendaService,
    TypeOrmModule,
  ],
})
export class TrasladoEncomiendaModule {}