import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Persona,
} from './persona.entity.js';

import {
  PersonasService,
} from './personas.service.js';

import {
  PersonasController,
} from './personas.controller.js';

import {
  FactilizaModule,
} from '../factiliza/factiliza.module.js';

@Module({
  imports: [

    TypeOrmModule.forFeature([
      Persona,
    ]),

    FactilizaModule,

  ],

  controllers: [
    PersonasController,
  ],

  providers: [
    PersonasService,
  ],

  exports: [
    PersonasService,
  ],
})
export class PersonasModule {}