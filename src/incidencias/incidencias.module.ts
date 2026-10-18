import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Incidencia,
} from './incidencia.entity.js';

import {
  Traslado,
} from '../traslados/traslado.entity.js';

import {
  TipoIncidencia,
} from '../tipos-incidencia/tipo-incidencia.entity.js';

import {
  User,
} from '../users/user.entity.js';

import {
  IncidenciasService,
} from './incidencias.service.js';

import {
  IncidenciasController,
} from './incidencias.controller.js';

import {
  FirebaseStorageService,
} from './firebase-storage.service.js';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      Incidencia,
      Traslado,
      TipoIncidencia,
      User,
    ]),

  ],

  providers: [
    IncidenciasService,
    FirebaseStorageService,
  ],

  controllers: [
    IncidenciasController,
  ],

  exports: [
    IncidenciasService,
    TypeOrmModule,
  ],

})
export class IncidenciasModule {}