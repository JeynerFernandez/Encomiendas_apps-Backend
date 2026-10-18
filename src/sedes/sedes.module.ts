import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SedesService } from './sedes.service.js';
import { SedesController } from './sedes.controller.js';
import { Sede } from './sede.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sede,
    ]),
  ],
  providers: [
    SedesService,
  ],
  controllers: [
    SedesController,
  ],
  exports: [
    SedesService,
    TypeOrmModule,
  ],
})
export class SedesModule {}