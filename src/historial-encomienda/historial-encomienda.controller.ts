import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import {
  HistorialEncomiendaService,
} from './historial-encomienda.service.js';

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

@ApiTags('historialencomienda')
@ApiBearerAuth('access-token')
@Controller('historial-encomienda',)
export class HistorialEncomiendaController {

  constructor(
    private historialService:
      HistorialEncomiendaService,
  ) {}

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.RECEPCION,
    JwtRole.ALMACEN,
    JwtRole.MOVILIDAD,
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

    return this.historialService
      .findByEncomienda(
        encomiendaId,
      );
  }

}