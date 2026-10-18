import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { VehiculosService } from './vehiculos.service.js';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto.js';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { JwtRolesGuard } from '../auth/jwt/jwt-roles.guard.js';
import { HasRoles } from '../auth/jwt/has-roles.js';
import { JwtRole } from '../auth/jwt/jwt-role.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('vehiculo')
@ApiBearerAuth('access-token')
@Controller('vehiculos')
export class VehiculosController {

  constructor(
    private vehiculoService:
      VehiculosService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
  )
  @Get()
  findAll() {

    return this.vehiculoService.findAll();

  }

  @UseGuards(
    JwtAuthGuard,
  )
  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.vehiculoService.findOne(
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
    vehiculo: CreateVehiculoDto,
  ) {

    return this.vehiculoService.create(
      vehiculo,
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
    vehiculo: UpdateVehiculoDto,
  ) {

    return this.vehiculoService.update(
      id,
      vehiculo,
    );

  }

}