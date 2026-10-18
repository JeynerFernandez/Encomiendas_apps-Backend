import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  TrasladoEncomiendaService,
} from './traslado-encomienda.service.js';

import {
  CreateTrasladoEncomiendaDto,
} from './dto/create-traslado-encomienda.dto.js';

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


@ApiTags('trasladoencomienda')
@ApiBearerAuth('access-token')
@Controller(
  'traslado-encomienda',
)
export class TrasladoEncomiendaController {

  constructor(
    private detalleService:
      TrasladoEncomiendaService,
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

    return this.detalleService.findAll();

  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.ALMACEN,
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
  ) {

    return this.detalleService
      .findByTraslado(
        trasladoId,
      );
  }

  @HasRoles(
    JwtRole.MOVILIDAD,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Get(
    'traslado/:trasladoId/sede/:sedeId',
  )
  findBySede(

    @Param(
      'trasladoId',
      ParseIntPipe,
    )
    trasladoId: number,

    @Param(
      'sedeId',
      ParseIntPipe,
    )
    sedeId: number,

    @Req()
    request: any,

  ) {

    return this.detalleService
      .findBySede(
        trasladoId,
        sedeId,
        request.user.userId,
      );
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

    return this.detalleService.findOne(
      id,
    );
  }

  @HasRoles(
    JwtRole.ALMACEN,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Post()
  create(

    @Body()
    detalle:
      CreateTrasladoEncomiendaDto,

    @Req()
    request: any,

  ) {

    return this.detalleService.create(
      detalle,
      request.user.sedeId,
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
    'traslado/:trasladoId/sede/:sedeId/descargar',
  )
  descargarPorSede(

    @Param(
      'trasladoId',
      ParseIntPipe,
    )
    trasladoId: number,

    @Param(
      'sedeId',
      ParseIntPipe,
    )
    sedeId: number,

    @Req()
    request: any,

  ) {

    return this.detalleService
      .descargarPorSede(
        trasladoId,
        sedeId,
        request.user.userId,
      );
  }

}