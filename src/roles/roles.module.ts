import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Rol,
} from './rol.entity.js';

import {
  RolesController,
} from './roles.controller.js';

import {
  RolesService,
} from './roles.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rol,
    ]),
  ],

  controllers: [
    RolesController,
  ],

  providers: [
    RolesService,
  ],

  exports: [
    RolesService,
    TypeOrmModule,
  ],
})
export class RolesModule {}