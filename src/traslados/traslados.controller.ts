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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import {
  TrasladosService,
} from './traslados.service.js';

import {
  CreateTrasladoDto,
} from './dto/create-traslado.dto.js';

import {
  UpdateTrasladoDto,
} from './dto/update-traslado.dto.js';

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


@ApiTags('traslado')
@ApiBearerAuth('access-token')
@Controller('traslados')
export class TrasladosController {

  constructor(
    private trasladoService:
      TrasladosService,
  ) {}


  // =====================================================
  // LISTADO GENERAL DE TRASLADOS
  // =====================================================

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.ALMACEN,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Listar todos los traslados',
  })
  @Get()
  findAll() {

    return this.trasladoService
      .findAll();
  }


  // =====================================================
  // TRASLADOS DISPONIBLES PARA ALMACÉN
  // =====================================================

  @HasRoles(
    JwtRole.ALMACEN,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Listar traslados disponibles para asignar encomiendas desde almacén',
  })
  @ApiParam({
    name:
      'destinoId',
    type:
      Number,
    example:
      2,
    description:
      'ID de la sede destino',
  })
  @Get(
    'disponibles/destino/:destinoId',
  )
  findDisponiblesParaAlmacen(

    @Param(
      'destinoId',
      ParseIntPipe,
    )
    destinoId: number,

    @Req()
    request: any,

  ) {

    return this.trasladoService
      .findDisponiblesParaAlmacen(
        request.user.sedeId,
        destinoId,
      );
  }


  // =====================================================
  // MOVILIDAD - MIS TRASLADOS
  // =====================================================

  @HasRoles(
    JwtRole.MOVILIDAD,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Listar los traslados asignados al conductor autenticado',
  })
  @Get(
    'movilidad/mis-traslados',
  )
  findMisTraslados(
    @Req()
    request: any,
  ) {

    return this.trasladoService
      .findMisTraslados(
        request.user.userId,
      );
  }


  // =====================================================
  // OBTENER TRASLADO POR ID
  // =====================================================

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.ALMACEN,
    JwtRole.MOVILIDAD,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Obtener detalle de un traslado',
  })
  @ApiParam({
    name:
      'id',
    type:
      Number,
    example:
      1,
    description:
      'ID del traslado',
  })
  @Get(':id')
  findOne(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

  ) {

    return this.trasladoService
      .findOne(
        id,
      );
  }


  // =====================================================
  // CREAR TRASLADO
  // =====================================================

  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Crear un nuevo traslado',
  })
  @Post()
  create(

    @Body()
    traslado:
      CreateTrasladoDto,

  ) {

    return this.trasladoService
      .create(
        traslado,
      );
  }


  // =====================================================
  // ACTUALIZAR TRASLADO
  // =====================================================

  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Actualizar un traslado programado',
  })
  @ApiParam({
    name:
      'id',
    type:
      Number,
    example:
      1,
    description:
      'ID del traslado',
  })
  @Put(':id')
  update(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    traslado:
      UpdateTrasladoDto,

  ) {

    return this.trasladoService
      .update(
        id,
        traslado,
      );
  }


  // =====================================================
  // MOVILIDAD - INICIAR TRASLADO
  // =====================================================

  @HasRoles(
    JwtRole.MOVILIDAD,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Iniciar un traslado asignado al conductor autenticado',
  })
  @ApiParam({
    name:
      'id',
    type:
      Number,
    example:
      1,
    description:
      'ID del traslado',
  })
  @Put(
    ':id/iniciar',
  )
  iniciar(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: any,

  ) {

    return this.trasladoService
      .iniciar(
        id,
        request.user.userId,
      );
  }


  // =====================================================
  // MOVILIDAD - FINALIZAR TRASLADO
  // =====================================================

  @HasRoles(
    JwtRole.MOVILIDAD,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Finalizar un traslado del conductor autenticado',
  })
  @ApiParam({
    name:
      'id',
    type:
      Number,
    example:
      1,
    description:
      'ID del traslado',
  })
  @Put(
    ':id/finalizar',
  )
  finalizar(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: any,

  ) {

    return this.trasladoService
      .finalizar(
        id,
        request.user.userId,
      );
  }


  // =====================================================
  // ADMINISTRADOR - CANCELAR TRASLADO
  // =====================================================

  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Cancelar un traslado programado',
  })
  @ApiParam({
    name:
      'id',
    type:
      Number,
    example:
      1,
    description:
      'ID del traslado',
  })
  @Put(
    ':id/cancelar',
  )
  cancelar(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

  ) {

    return this.trasladoService
      .cancelar(
        id,
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
  ':id/retornar-sede-central',
)
retornarSedeCentral(
  @Param(
    'id',
    ParseIntPipe,
  )
  id: number,

  @Req()
  request: any,
) {

  return this.trasladoService.retornarASedeCentral(
      id,
      request.user.userId,
    );
}

}