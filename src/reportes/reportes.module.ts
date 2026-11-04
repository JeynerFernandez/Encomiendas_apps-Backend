import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  ReportesController,
} from './reportes.controller.js';

import {
  ReportesService,
} from './reportes.service.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  Pago,
} from '../pagos/pago.entity.js';

import {
  Traslado,
} from '../traslados/traslado.entity.js';

import {
  User,
} from '../users/user.entity.js';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      Encomienda,
      Pago,
      Traslado,
      User,
    ]),

  ],

  controllers: [
    ReportesController,
  ],

  providers: [
    ReportesService,
  ],

  exports: [
    ReportesService,
  ],

})
export class ReportesModule {}