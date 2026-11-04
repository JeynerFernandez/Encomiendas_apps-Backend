import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

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
import { RastrearEncomiendaDto } from './dto/rastrear-encomienda.dto.js';


@ApiTags('encomienda')
@ApiBearerAuth('access-token')
@Controller('encomienda')
export class EncomiendaController {

  constructor(

    private encomiendaService:
      EncomiendaService,

  ) {}


  // =====================================================
  // LISTAR TODAS
  // =====================================================

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


  // =====================================================
  // LISTAR PARA ALMACEN
  //
  // IMPORTANTE:
  // debe estar antes de @Get(':id')
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
      'Listar encomiendas de la sede del almacenero hacia una sede destino',
  })
  @ApiParam({
    name:
      'destinoId',
    example:
      3,
    description:
      'ID de la sede destino seleccionada',
  })
  @ApiQuery({
  name: 'filtro',
  required: false,
  example: 'pendientes',
  enum: [
    'pendientes',
    'asignadas',
    'todas',
  ],
  description:
    'pendientes muestra encomiendas que requieren acción del almacén; asignadas muestra encomiendas en almacén con movilidad programada; todas muestra todas las encomiendas de esa ruta',
})
  @Get(
    'almacen/destino/:destinoId',
  )
  buscarParaAlmacen(

    @Param(
      'destinoId',
      ParseIntPipe,
    )
    destinoId: number,

    @Query(
      'filtro',
    )
    filtro:
      string = 'pendientes',

    @Req()
    request: any,

  ) {

    return this.encomiendaService
      .buscarParaAlmacen(

        request.user.sedeId,

        destinoId,

        filtro,

      );

  }


  // =====================================================
  // INGRESAR AL ALMACEN POR CODIGO
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
      'Ingresar encomienda al almacén mediante código de rastreo',
  })
  @ApiParam({
    name:
      'codigoRastreo',
    example:
      'MY-1F7476B9',
    description:
      'Código de rastreo de la encomienda',
  })
  @Put(
    'codigo/:codigoRastreo/ingresar-almacen',
  )
  ingresarAlmacen(

    @Param(
      'codigoRastreo',
    )
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

  @HasRoles(
    JwtRole.RECEPCION,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @ApiOperation({
    summary:
      'Entregar una encomienda en la sede destino',
  })
  @ApiParam({
    name:
      'id',
    example:
      1,
    description:
      'ID de la encomienda',
  })
  @Put(
    ':id/entregar',
  )
  entregar(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: any,

  ) {

    return this.encomiendaService
      .entregar(

        id,

        request.user.sedeId,

      );

  }


  // =====================================================
  // BUSCAR POR ID
  // =====================================================

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
    ':id',
  )
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


  // =====================================================
  // CREAR ENCOMIENDA
  // =====================================================

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


  // =====================================================
  // ACTUALIZAR ENCOMIENDA
  // =====================================================

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.RECEPCION,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Put(
    ':id',
  )
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
  JwtRole.CLIENTE,
)
@UseGuards(
  JwtAuthGuard,
  JwtRolesGuard,
)
@ApiOperation({
  summary:
    'Rastrear una encomienda mediante código y clave de 4 dígitos',
})
@Post(
  'rastrear',
)
rastrear(
  @Body()
  datos:
    RastrearEncomiendaDto,
) {

  return this.encomiendaService
    .rastrear(
      datos,
    );
}

}