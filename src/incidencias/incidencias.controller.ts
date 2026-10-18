import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  IncidenciasService,
} from './incidencias.service.js';

import {
  CreateIncidenciaDto,
} from './dto/create-incidencia.dto.js';

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

@ApiTags('incidencias')
@ApiBearerAuth('access-token')
@Controller('incidencias')
export class IncidenciasController {

  constructor(
    private incidenciasService:
      IncidenciasService,
  ) {}

  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Get()
  findAll() {

    return this.incidenciasService
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
    'traslado/:trasladoId',
  )
  findByTraslado(

    @Param(
      'trasladoId',
      ParseIntPipe,
    )
    trasladoId: number,

    @Req()
    request: any,

  ) {

    return this.incidenciasService
      .findByTraslado(
        trasladoId,
        request.user.userId,
        request.user.role,
      );
  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.MOVILIDAD,
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

    @Req()
    request: any,

  ) {

    return this.incidenciasService
      .findOne(
        id,
        request.user.userId,
        request.user.role,
      );
  }

  @HasRoles(
    JwtRole.MOVILIDAD,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Post(
    'traslado/:trasladoId',
  )
  @UseInterceptors(
    FileInterceptor(
      'imagen',
    ),
  )
  create(

    @Param(
      'trasladoId',
      ParseIntPipe,
    )
    trasladoId: number,

    @Body()
    incidencia:
      CreateIncidenciaDto,

    @UploadedFile()
    imagen:
      Express.Multer.File,

    @Req()
    request: any,

  ) {

    return this.incidenciasService
      .create(
        trasladoId,
        incidencia,
        request.user.userId,
        imagen,
      );
  }

}