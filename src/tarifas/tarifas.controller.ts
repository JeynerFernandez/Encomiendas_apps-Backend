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
import { TarifasService } from './tarifas.service.js';
import { CreateTarifaDto } from './dto/create-tarifa.dto.js';
import { UpdateTarifaDto } from './dto/update-tarifa.dto.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { JwtRolesGuard } from '../auth/jwt/jwt-roles.guard.js';
import { HasRoles } from '../auth/jwt/has-roles.js';
import { JwtRole } from '../auth/jwt/jwt-role.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('tarifas')
@ApiBearerAuth('access-token')
@Controller('tarifas')
export class TarifasController {

  constructor(
    private tarifaService:
      TarifasService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
  )
  @Get()
  findAll() {

    return this.tarifaService.findAll();

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

    return this.tarifaService.findOne(
      id,
    );

  }

  @UseGuards(
    JwtAuthGuard,
  )
  @Get(
    'buscar/:origenId/:destinoId',
  )
  findBySedes(

    @Param(
      'origenId',
      ParseIntPipe,
    )
    origenId: number,

    @Param(
      'destinoId',
      ParseIntPipe,
    )
    destinoId: number,

  ) {

    return this.tarifaService
      .findBySedes(
        origenId,
        destinoId,
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
    tarifa: CreateTarifaDto,
  ) {

    return this.tarifaService.create(
      tarifa,
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
    tarifa: UpdateTarifaDto,

  ) {

    return this.tarifaService.update(
      id,
      tarifa,
    );

  }

}