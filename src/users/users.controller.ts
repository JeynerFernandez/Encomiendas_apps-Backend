import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  UsersService,
} from './users.service.js';

import {
  HasRoles,
} from '../auth/jwt/has-roles.js';

import {
  JwtRole,
} from '../auth/jwt/jwt-role.js';

import {
  JwtAuthGuard,
} from '../auth/jwt/jwt.guard.js';

import {
  JwtRolesGuard,
} from '../auth/jwt/jwt-roles.guard.js';

import {
  CreateUserDto,
} from './dto/create-user-dto.js';

import {
  UpdateUserDto,
} from './dto/update-user.dto.js';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {

  constructor(
    private readonly userService:
      UsersService,
  ) {}

  @ApiOperation({
    summary:
      'Listar usuarios',
  })
  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Get()
  findAll() {

    return this.userService
      .findAll();

  }

  @ApiOperation({
    summary:
      'Crear usuario',
  })
  @ApiBody({
    type:
      CreateUserDto,
  })
  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Post()
  create(
    @Body()
    user:
      CreateUserDto,
  ) {

    return this.userService
      .create(
        user,
      );

  }

  @ApiOperation({
    summary:
      'Actualizar usuario',
  })
  @ApiBody({
    type:
      UpdateUserDto,
  })
  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Put(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    user:
      UpdateUserDto,
  ) {

    return this.userService
      .update(
        id,
        user,
      );

  }

}