import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  ReportesService,
} from './reportes.service.js';

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

@ApiTags('Reportes')
@ApiBearerAuth('access-token')
@Controller('reportes')
export class ReportesController {

  constructor(
    private readonly reportesService:
      ReportesService,
  ) {}

  @ApiOperation({
    summary:
      'Obtener reportes estadísticos del sistema',
  })
  @ApiOkResponse({
    description:
      'Estadísticas generales de MANDA YA',
  })
  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Get('estadisticas')
  obtenerEstadisticas() {

    return this.reportesService
      .obtenerEstadisticas();

  }

}