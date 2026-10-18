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
  EncomiendaService,
} from './encomienda.service.js';

import {
  CreateEncomiendaDto,
} from './dto/create-encomienda.dto.js';

import {
  UpdateEncomiendaDto,
} from './dto/update-encomienda.dto.js';

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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('encomienda')
@ApiBearerAuth('access-token')
@Controller('encomienda')
export class EncomiendaController {

  constructor(
    private encomiendaService:
      EncomiendaService,
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
  @Get()
  findAll() {

    return this.encomiendaService
      .findAll();
  }

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
  @Get(':id')
  findOne(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

  ) {

    return this.encomiendaService
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
    encomienda:
      CreateEncomiendaDto,

    @Req()
    request: any,

  ) {

    return this.encomiendaService
      .create(
        encomienda,
        request.user.userId,
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
  @Put(':id')
  update(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    encomienda:
      UpdateEncomiendaDto,

  ) {

    return this.encomiendaService
      .update(
        id,
        encomienda,
      );
  }

  @HasRoles(
    JwtRole.ALMACEN,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
  summary:
    'Ingresar encomienda al almacén mediante código de rastreo',
})
@ApiParam({
  name: 'codigoRastreo',
  example: 'MY-1F7476B9',
  description:
    'Código de rastreo de la encomienda',
})
@HasRoles(
  JwtRole.ALMACEN,
)
@UseGuards(
  JwtAuthGuard,
  JwtRolesGuard,
)
@Put(
  'codigo/:codigoRastreo/ingresar-almacen',
)
ingresarAlmacen(
  @Param('codigoRastreo')
  codigoRastreo: string,

  @Req()
  request: any,
) {

  return this.encomiendaService
    .ingresarAlmacenPorCodigo(
      codigoRastreo,
      request.user.sedeId,
    );
}
}