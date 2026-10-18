import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  EntregasService,
} from './entregas.service.js';

import {
  CreateEntregaDto,
} from './dto/create-entrega.dto.js';

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

@ApiTags('Entregas')
@ApiBearerAuth('access-token')
@Controller('entregas')
export class EntregasController {

  constructor(
    private entregasService:
      EntregasService,
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

    return this.entregasService
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
    'encomienda/:encomiendaId',
  )
  findByEncomienda(

    @Param(
      'encomiendaId',
      ParseIntPipe,
    )
    encomiendaId: number,

  ) {

    return this.entregasService
      .findByEncomienda(
        encomiendaId,
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
  @Get(':id')
  findOne(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

  ) {

    return this.entregasService
      .findOne(
        id,
      );
  }

  @HasRoles(
    JwtRole.RECEPCION,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Post(
    'encomienda/:encomiendaId',
  )
  entregar(

    @Param(
      'encomiendaId',
      ParseIntPipe,
    )
    encomiendaId: number,

    @Body()
    entrega:
      CreateEntregaDto,

    @Req()
    request: any,

  ) {

    return this.entregasService
      .entregar(
        encomiendaId,
        entrega,
        request.user.userId,
        request.user.sedeId,
      );
  }

}