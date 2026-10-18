import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  TipoIncidencia,
} from './tipo-incidencia.entity.js';

import {
  CreateTipoIncidenciaDto,
} from './dto/create-tipo-incidencia.dto.js';

import {
  UpdateTipoIncidenciaDto,
} from './dto/update-tipo-incidencia.dto.js';

@Injectable()
export class TiposIncidenciaService {

  constructor(

    @InjectRepository(
      TipoIncidencia,
    )
    private tipoIncidenciaRepository:
      Repository<TipoIncidencia>,

  ) {}

  async create(
    tipo:
      CreateTipoIncidenciaDto,
  ) {

    const tipoExist =
      await this
        .tipoIncidenciaRepository
        .findOne({
          where: {
            nombre:
              tipo.nombre,
          },
        });

    if (tipoExist) {

      throw new ConflictException(
        'El tipo de incidencia ya existe',
      );

    }

    const newTipo =
      this
        .tipoIncidenciaRepository
        .create({

          nombre:
            tipo.nombre,

          descripcion:
            tipo.descripcion ??
            null,

          active:
            true,

        });

    return this
      .tipoIncidenciaRepository
      .save(
        newTipo,
      );
  }

  findAll() {

    return this
      .tipoIncidenciaRepository
      .find({
        order: {
          id: 'DESC',
        },
      });
  }

  findActive() {

    return this
      .tipoIncidenciaRepository
      .find({

        where: {
          active: true,
        },

        order: {
          nombre: 'ASC',
        },

      });
  }

  async findOne(
    id: number,
  ) {

    const tipo =
      await this
        .tipoIncidenciaRepository
        .findOneBy({
          id: id,
        });

    if (!tipo) {

      throw new NotFoundException(
        'El tipo de incidencia no existe',
      );

    }

    return tipo;
  }

  async findActiveById(
    id: number,
  ) {

    const tipo =
      await this
        .tipoIncidenciaRepository
        .findOneBy({
          id: id,
          active: true,
        });

    if (!tipo) {

      throw new NotFoundException(
        'El tipo de incidencia no existe o está inactivo',
      );

    }

    return tipo;
  }

  async update(
    id: number,
    tipo:
      UpdateTipoIncidenciaDto,
  ) {

    const tipoFound =
      await this.findOne(
        id,
      );

    if (
      tipo.nombre !==
      undefined
    ) {

      const tipoExist =
        await this
          .tipoIncidenciaRepository
          .findOne({
            where: {
              nombre:
                tipo.nombre,
            },
          });

      if (
        tipoExist &&
        tipoExist.id !== id
      ) {

        throw new ConflictException(
          'Ya existe otro tipo de incidencia con ese nombre',
        );

      }

    }

    Object.assign(
      tipoFound,
      tipo,
    );

    return this
      .tipoIncidenciaRepository
      .save(
        tipoFound,
      );
  }

}