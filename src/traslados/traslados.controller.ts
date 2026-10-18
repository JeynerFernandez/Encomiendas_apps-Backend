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
import { TrasladosService } from './traslados.service.js';
import { CreateTrasladoDto } from './dto/create-traslado.dto.js';
import { UpdateTrasladoDto } from './dto/update-traslado.dto.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { JwtRolesGuard } from '../auth/jwt/jwt-roles.guard.js';
import { HasRoles } from '../auth/jwt/has-roles.js';
import { JwtRole } from '../auth/jwt/jwt-role.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('traslado')
@ApiBearerAuth('access-token')
@Controller('traslados')
export class TrasladosController {

  constructor(
    private trasladoService:
      TrasladosService,
  ) {}

  @HasRoles(
    JwtRole.ADMINISTRADOR,
    JwtRole.ALMACEN,
    JwtRole.MOVILIDAD,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Get()
  findAll() {

    return this.trasladoService.findAll();

  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
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

    return this.trasladoService.findOne(
      id,
    );

  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Post()
  create(
    @Body()
    traslado: CreateTrasladoDto,
  ) {

    return this.trasladoService.create(
      traslado,
    );

  }

  @HasRoles(
    JwtRole.ADMINISTRADOR,
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
    traslado: UpdateTrasladoDto,
  ) {

    return this.trasladoService.update(
      id,
      traslado,
    );

  }

  @HasRoles(
    JwtRole.MOVILIDAD,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Put(':id/iniciar')
  iniciar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: any,
  ) {

    return this.trasladoService.iniciar(
      id,
      request.user.userId,
    );

  }

  @HasRoles(
    JwtRole.MOVILIDAD,
  )
  @UseGuards(
    JwtAuthGuard,
    JwtRolesGuard,
  )
  @Put(':id/finalizar')
  finalizar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: any,
  ) {

    return this.trasladoService.finalizar(
      id,
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
  @Put(':id/cancelar')
  cancelar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.trasladoService.cancelar(
      id,
    );

  }

}