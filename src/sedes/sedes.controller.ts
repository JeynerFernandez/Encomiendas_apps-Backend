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
  ApiTags,
} from '@nestjs/swagger';

import {
  SedesService,
} from './sedes.service.js';

import {
  CreateSedeDto,
} from './dto/create-sede.dto.js';

import {
  UpdateSedeDto,
} from './dto/update-sede.dto.js';

import {
  JwtAuthGuard,
} from '../auth/jwt/jwt.guard.js';

import {
  JwtRolesGuard,
} from '../auth/jwt/jwt-roles.guard.js';

import {
  HasRoles,
} from '../auth/jwt/has-roles.js';

import {
  JwtRole,
} from '../auth/jwt/jwt-role.js';

@ApiTags('Sedes')
@ApiBearerAuth('access-token')
@Controller('sedes')
export class SedesController {

  constructor(
    private readonly sedeService:
      SedesService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
  )
  @Get()
  findAll() {

    return this.sedeService
      .findAll();

  }

  @UseGuards(
    JwtAuthGuard,
  )
  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.sedeService
      .findOne(
        id,
      );

  }

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
    sede: CreateSedeDto,
  ) {

    return this.sedeService
      .create(
        sede,
      );

  }

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
    sede: UpdateSedeDto,
  ) {

    return this.sedeService
      .update(
        id,
        sede,
      );

  }

}