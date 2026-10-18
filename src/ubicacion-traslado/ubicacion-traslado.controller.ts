import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  UbicacionTrasladoService,
} from './ubicacion-traslado.service.js';

import {
  UpdateUbicacionTrasladoDto,
} from './dto/update-ubicacion-traslado.dto.js';

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

@ApiTags('ubicacion')
@ApiBearerAuth('access-token')
@Controller(
  'ubicacion-traslado',
)
export class UbicacionTrasladoController {

  constructor(
    private ubicacionTrasladoService:
      UbicacionTrasladoService,
  ) {}

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

    return this
      .ubicacionTrasladoService
      .findByTraslado(
        trasladoId,
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
  @Put(
    'traslado/:trasladoId',
  )
  actualizar(

    @Param(
      'trasladoId',
      ParseIntPipe,
    )
    trasladoId: number,

    @Body()
    ubicacion:
      UpdateUbicacionTrasladoDto,

    @Req()
    request: any,

  ) {

    return this
      .ubicacionTrasladoService
      .actualizar(
        trasladoId,
        ubicacion,
        request.user.userId,
      );
  }

}