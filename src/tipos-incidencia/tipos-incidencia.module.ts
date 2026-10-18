import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  TipoIncidencia,
} from './tipo-incidencia.entity.js';

import {
  TiposIncidenciaService,
} from './tipos-incidencia.service.js';

import {
  TiposIncidenciaController,
} from './tipos-incidencia.controller.js';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      TipoIncidencia,
    ]),

  ],

  providers: [
    TiposIncidenciaService,
  ],

  controllers: [
    TiposIncidenciaController,
  ],

  exports: [
    TiposIncidenciaService,
    TypeOrmModule,
  ],

})
export class TiposIncidenciaModule {}