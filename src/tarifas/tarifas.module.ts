import {
  Module,
} from '@nestjs/common';
import {
  TypeOrmModule,
} from '@nestjs/typeorm';
import { Tarifa } from './tarifa.entity.js';
import { Sede } from '../sedes/sede.entity.js';
import { TarifasService } from './tarifas.service.js';
import { TarifasController } from './tarifas.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tarifa,
      Sede,
    ]),
  ],
  providers: [
    TarifasService,
  ],
  controllers: [
    TarifasController,
  ],
  exports: [
    TarifasService,
    TypeOrmModule,
  ],
})
export class TarifasModule {}