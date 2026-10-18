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
  TiposIncidenciaService,
} from './tipos-incidencia.service.js';

import {
  CreateTipoIncidenciaDto,
} from './dto/create-tipo-incidencia.dto.js';

import {
  UpdateTipoIncidenciaDto,
} from './dto/update-tipo-incidencia.dto.js';

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


@ApiTags('tiposincidencia')
@ApiBearerAuth('access-token')
@Controller(
  'tipos-incidencia',
)
export class TiposIncidenciaController {

  constructor(
    private tiposIncidenciaService:
      TiposIncidenciaService,
  ) {}

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
    tipo:
      CreateTipoIncidenciaDto,

  ) {

    return this
      .tiposIncidenciaService
      .create(
        tipo,
      );
  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Get()
  findAll() {

    return this
      .tiposIncidenciaService
      .findAll();
  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.MOVILIDAD,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Get(
    'activos',
  )
  findActive() {

    return this
      .tiposIncidenciaService
      .findActive();
  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Get(':id')
  findOne(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

  ) {

    return this
      .tiposIncidenciaService
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
  @Put(':id')
  update(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    tipo:
      UpdateTipoIncidenciaDto,

  ) {

    return this
      .tiposIncidenciaService
      .update(
        id,
        tipo,
      );
  }

}