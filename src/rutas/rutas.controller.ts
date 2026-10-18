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
import { RutasService } from './rutas.service.js';
import { CreateRutaDto } from './dto/create-ruta.dto.js';
import { UpdateRutaDto } from './dto/update-ruta.dto.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { JwtRolesGuard } from '../auth/jwt/jwt-roles.guard.js';
import { HasRoles } from '../auth/jwt/has-roles.js';
import { JwtRole } from '../auth/jwt/jwt-role.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('rutas')
@ApiBearerAuth('access-token')
@Controller('rutas')
export class RutasController {

  constructor(
    private rutaService:
      RutasService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
  )
  @Get()
  findAll() {

    return this.rutaService.findAll();

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

    return this.rutaService.findOne(
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
    ruta: CreateRutaDto,
  ) {

    return this.rutaService.create(
      ruta,
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
    ruta: UpdateRutaDto,
  ) {

    return this.rutaService.update(
      id,
      ruta,
    );

  }

}