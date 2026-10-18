import {
  Module,
} from '@nestjs/common';
import {
  TypeOrmModule,
} from '@nestjs/typeorm';
import { Vehiculo } from './vehiculo.entity.js';
import { VehiculosService } from './vehiculos.service.js';
import { VehiculosController } from './vehiculos.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehiculo,
    ]),
  ],
  providers: [
    VehiculosService,
  ],
  controllers: [
    VehiculosController,
  ],
  exports: [
    VehiculosService,
    TypeOrmModule,
  ],
})
export class VehiculosModule {}