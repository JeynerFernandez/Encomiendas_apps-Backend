import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  RolesService,
} from './roles.service.js';

import {
  CreateRolDto,
} from './dto/create-rol.dto.js';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {

  constructor(
    private readonly rolesService:
      RolesService,
  ) {}

  @ApiOperation({
    summary: 'Listar roles',
  })
  @Get()
  findAll() {

    return this.rolesService.findAll();

  }

  @ApiOperation({
    summary: 'Buscar rol por ID',
  })
  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.rolesService.findOne(
      id,
    );

  }

  @ApiOperation({
    summary: 'Crear rol',
  })
  @Post()
  create(
    @Body()
    rol: CreateRolDto,
  ) {

    return this.rolesService.create(
      rol,
    );

  }
}