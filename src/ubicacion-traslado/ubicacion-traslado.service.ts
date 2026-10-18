import {
  BadRequestException,
  ForbiddenException,
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
  UbicacionTraslado,
} from './ubicacion-traslado.entity.js';

import {
  Traslado,
  TrasladoEstado,
} from '../traslados/traslado.entity.js';

import {
  JwtRole,
} from '../auth/jwt/jwt-role.js';

import {
  UpdateUbicacionTrasladoDto,
} from './dto/update-ubicacion-traslado.dto.js';

@Injectable()
export class UbicacionTrasladoService {

  constructor(

    @InjectRepository(
      UbicacionTraslado,
    )
    private ubicacionRepository:
      Repository<UbicacionTraslado>,

    @InjectRepository(
      Traslado,
    )
    private trasladoRepository:
      Repository<Traslado>,

  ) {}

  async actualizar(
    trasladoId: number,
    ubicacion:
      UpdateUbicacionTrasladoDto,
    userId: number,
  ) {

    const traslado =
      await this.trasladoRepository
        .findOne({

          where: {
            id: trasladoId,
          },

          relations: {
            conductor: true,
            ruta: true,
            vehiculo: true,
          },

        });

    if (!traslado) {

      throw new NotFoundException(
        'El traslado no existe',
      );

    }

    if (
      traslado.conductor.id !==
      userId
    ) {

      throw new ForbiddenException(
        'Este traslado no está asignado a este conductor',
      );

    }

    if (
      traslado.estado !==
      TrasladoEstado.EN_CURSO
    ) {

      throw new BadRequestException(
        'Solo se puede actualizar la ubicación de un traslado en curso',
      );

    }

    let ubicacionFound =
      await this.ubicacionRepository
        .findOne({

          where: {

            traslado: {
              id: trasladoId,
            },

          },

          relations: {
            traslado: true,
          },

        });

    if (!ubicacionFound) {

      ubicacionFound =
        this.ubicacionRepository
          .create({

            traslado:
              traslado,

            latitud:
              ubicacion.latitud,

            longitud:
              ubicacion.longitud,

          });

    } else {

      ubicacionFound.latitud =
        ubicacion.latitud;

      ubicacionFound.longitud =
        ubicacion.longitud;

    }

    const ubicacionSaved =
      await this.ubicacionRepository
        .save(
          ubicacionFound,
        );

    return {

      message:
        'Ubicación actualizada correctamente',

      ubicacion: {

        id:
          ubicacionSaved.id,

        traslado_id:
          traslado.id,

        latitud:
          ubicacionSaved.latitud,

        longitud:
          ubicacionSaved.longitud,

        ruta:
          traslado.ruta.name,

        vehiculo:
          traslado.vehiculo.placa,

        updated_at:
          ubicacionSaved.updated_at,

      },

    };
  }

  async findByTraslado(
    trasladoId: number,
    userId: number,
    role: JwtRole,
  ) {

    const traslado =
      await this.trasladoRepository
        .findOne({

          where: {
            id: trasladoId,
          },

          relations: {
            conductor: true,
            ruta: true,
            vehiculo: true,
          },

        });

    if (!traslado) {

      throw new NotFoundException(
        'El traslado no existe',
      );

    }

    if (
      role ===
        JwtRole.MOVILIDAD &&
      traslado.conductor.id !==
        userId
    ) {

      throw new ForbiddenException(
        'No puedes consultar la ubicación de otro conductor',
      );

    }

    const ubicacion =
      await this.ubicacionRepository
        .findOne({

          where: {

            traslado: {
              id: trasladoId,
            },

          },

        });

    if (!ubicacion) {

      throw new NotFoundException(
        'El traslado todavía no tiene una ubicación registrada',
      );

    }

    return {

      traslado: {

        id:
          traslado.id,

        estado:
          traslado.estado,

        ruta:
          traslado.ruta.name,

        vehiculo:
          traslado.vehiculo.placa,

        conductor: {
          id:
            traslado.conductor.id,

          nombre:
            traslado.conductor.name,
        },

      },

      ubicacion: {

        latitud:
          ubicacion.latitud,

        longitud:
          ubicacion.longitud,

        updated_at:
          ubicacion.updated_at,

      },

    };
  }

}