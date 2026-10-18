import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity.js';
import { Rol } from '../roles/rol.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Rol,
    ]),
  ],
  providers: [
    UsersService,
  ],
  controllers: [
    UsersController,
  ],
  exports: [
    UsersService,
    TypeOrmModule,
  ],
})
export class UsersModule {}
