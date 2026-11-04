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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

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
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Listar todas las entregas registradas',
  })
  @Get()
  findAll() {

    return this.entregasService
      .findAll();
  }


  @HasRoles(
    JwtRole.RECEPCION,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Listar encomiendas pendientes de entrega en la sede del recepcionista',
  })
  @Get(
    'pendientes',
  )
  findPendientes(
    @Req()
    request: any,
  ) {

    return this.entregasService
      .findPendientes(
        request.user.userId,
        request.user.sedeId,
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
  @ApiOperation({
    summary:
      'Consultar entrega mediante ID de encomienda',
  })
  @ApiParam({
    name:
      'encomiendaId',
    type:
      Number,
    example:
      1,
  })
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
  @ApiOperation({
    summary:
      'Consultar una entrega mediante su ID',
  })
  @ApiParam({
    name:
      'id',
    type:
      Number,
    example:
      1,
  })
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
  @ApiOperation({
    summary:
      'Entregar una encomienda al destinatario validando sede, pago, DNI y clave',
  })
  @ApiParam({
    name:
      'encomiendaId',
    type:
      Number,
    example:
      1,
  })
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