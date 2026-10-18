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
  PagosService,
} from './pagos.service.js';

import {
  UpdatePagoDto,
} from './dto/update-pago.dto.js';

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

@ApiTags('pagos')
@ApiBearerAuth('access-token')
@Controller('pagos')
export class PagosController {

  constructor(
    private pagosService:
      PagosService,
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

    return this.pagosService
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

    return this.pagosService
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

    return this.pagosService
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
  @Put(
    'encomienda/:encomiendaId/modalidad',
  )
  updateModalidad(

    @Param(
      'encomiendaId',
      ParseIntPipe,
    )
    encomiendaId: number,

    @Body()
    pago: UpdatePagoDto,

    @Req()
    request: any,

  ) {

    return this.pagosService
      .updateModalidad(
        encomiendaId,
        pago,
        request.user.sedeId,
      );
  }

  @HasRoles(
    JwtRole.RECEPCION,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Put(
    'encomienda/:encomiendaId/pagar',
  )
  pagar(

    @Param(
      'encomiendaId',
      ParseIntPipe,
    )
    encomiendaId: number,

    @Req()
    request: any,

  ) {

    return this.pagosService
      .pagar(
        encomiendaId,
        request.user.sedeId,
      );
  }

}