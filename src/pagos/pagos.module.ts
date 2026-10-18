import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Pago,
} from './pago.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  PagosService,
} from './pagos.service.js';

import {
  PagosController,
} from './pagos.controller.js';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      Pago,
      Encomienda,
    ]),

  ],

  providers: [
    PagosService,
  ],

  controllers: [
    PagosController,
  ],

  exports: [
    PagosService,
    TypeOrmModule,
  ],

})
export class PagosModule {}