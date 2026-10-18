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
  PersonasService,
} from './personas.service.js';

import {
  CreatePersonaDto,
} from './dto/create-persona.dto.js';

import {
  UpdatePersonaDto,
} from './dto/update-persona.dto.js';

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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('persona')
@ApiBearerAuth('access-token')
@Controller(
  'personas',
)
export class PersonasController {

  constructor(
    private readonly personaService:
      PersonasService,
  ) {}

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.RECEPCION,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Get()
  findAll() {

    return this.personaService
      .findAll();

  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.RECEPCION,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Get(
    'dni/:dni',
  )
  findByDni(
    @Param(
      'dni',
    )
    dni: string,
  ) {

    return this.personaService
      .findByDni(
        dni,
      );

  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.RECEPCION,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Get(
    ':id',
  )
  findOne(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

  ) {

    return this.personaService
      .findOne(
        id,
      );

  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.RECEPCION,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Post()
  create(
    @Body()
    persona:
      CreatePersonaDto,
  ) {

    return this.personaService
      .create(
        persona,
      );

  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Put(
    ':id',
  )
  update(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    persona:
      UpdatePersonaDto,

  ) {

    return this.personaService
      .update(
        id,
        persona,
      );

  }
}