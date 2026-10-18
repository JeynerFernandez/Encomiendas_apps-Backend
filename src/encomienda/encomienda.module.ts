import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Encomienda,
} from './encomienda.entity.js';

import {
  Persona,
} from '../personas/persona.entity.js';

import {
  Sede,
} from '../sedes/sede.entity.js';

import {
  Ruta,
} from '../rutas/ruta.entity.js';

import {
  User,
} from '../users/user.entity.js';

import {
  TarifasModule,
} from '../tarifas/tarifas.module.js';

import {
  HistorialEncomiendaModule,
} from '../historial-encomienda/historial-encomienda.module.js';

import {
  PagosModule,
} from '../pagos/pagos.module.js';

import {
  EncomiendaService,
} from './encomienda.service.js';

import {
  EncomiendaController,
} from './encomienda.controller.js';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      Encomienda,
      Persona,
      Sede,
      Ruta,
      User,
    ]),

    TarifasModule,

    HistorialEncomiendaModule,

    PagosModule,

  ],

  providers: [
    EncomiendaService,
  ],

  controllers: [
    EncomiendaController,
  ],

  exports: [
    EncomiendaService,
    TypeOrmModule,
  ],

})
export class EncomiendaModule {}