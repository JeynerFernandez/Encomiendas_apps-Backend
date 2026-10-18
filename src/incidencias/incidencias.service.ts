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
  Incidencia,
} from './incidencia.entity.js';

import {
  Traslado,
  TrasladoEstado,
} from '../traslados/traslado.entity.js';

import {
  TipoIncidencia,
} from '../tipos-incidencia/tipo-incidencia.entity.js';

import {
  User,
} from '../users/user.entity.js';

import {
  JwtRole,
} from '../auth/jwt/jwt-role.js';

import {
  CreateIncidenciaDto,
} from './dto/create-incidencia.dto.js';

import {
  FirebaseStorageService,
} from './firebase-storage.service.js';

@Injectable()
export class IncidenciasService {

  constructor(

    @InjectRepository(Incidencia)
    private incidenciaRepository:
      Repository<Incidencia>,

    @InjectRepository(Traslado)
    private trasladoRepository:
      Repository<Traslado>,

    @InjectRepository(TipoIncidencia)
    private tipoIncidenciaRepository:
      Repository<TipoIncidencia>,

    @InjectRepository(User)
    private userRepository:
      Repository<User>,

    private firebaseStorageService:
      FirebaseStorageService,

  ) {}

  async create(
    trasladoId: number,
    incidencia:
      CreateIncidenciaDto,
    userId: number,
    imagen:
      Express.Multer.File | undefined,
  ) {

    const usuario =
      await this.userRepository.findOne({

        where: {
          id: userId,
          active: true,
        },

        relations: {
          role: true,
        },

      });

    if (!usuario) {

      throw new NotFoundException(
        'El usuario no existe o está inactivo',
      );

    }

    if (
      usuario.role.name !==
      JwtRole.MOVILIDAD
    ) {

      throw new ForbiddenException(
        'Solo MOVILIDAD puede registrar incidencias',
      );

    }

    const traslado =
      await this.trasladoRepository.findOne({

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
        'Solo se pueden registrar incidencias durante un traslado en curso',
      );

    }

    const tipo =
      await this
        .tipoIncidenciaRepository
        .findOneBy({

          id:
            incidencia.tipoIncidenciaId,

          active:
            true,

        });

    if (!tipo) {

      throw new NotFoundException(
        'El tipo de incidencia no existe o está inactivo',
      );

    }

    const descripcion =
      incidencia.descripcion.trim();

    if (
      descripcion.length === 0
    ) {

      throw new BadRequestException(
        'La descripción de la incidencia es obligatoria',
      );

    }

    const imagenUrl =
      await this
        .firebaseStorageService
        .uploadIncidencia(
          imagen,
        );

    const newIncidencia =
      this.incidenciaRepository.create({

        traslado:
          traslado,

        tipo:
          tipo,

        usuario_reporta:
          usuario,

        descripcion:
          descripcion,

        imagen_url:
          imagenUrl,

      });

    const incidenciaSaved =
      await this.incidenciaRepository.save(
        newIncidencia,
      );

    return {

      message:
        'Incidencia registrada correctamente',

      incidencia: {

        id:
          incidenciaSaved.id,

        traslado: {
          id:
            traslado.id,

          ruta:
            traslado.ruta.name,

          vehiculo:
            traslado.vehiculo.placa,
        },

        tipo: {
          id:
            tipo.id,

          nombre:
            tipo.nombre,
        },

        descripcion:
          incidenciaSaved.descripcion,

        imagen_url:
          incidenciaSaved.imagen_url,

        reportado_por: {
          id:
            usuario.id,

          nombre:
            usuario.name,
        },

        created_at:
          incidenciaSaved.created_at,

      },

    };
  }

  findAll() {

    return this.incidenciaRepository.find({

      relations: {

        traslado: {

          ruta:
            true,

          vehiculo:
            true,

          conductor:
            true,

        },

        tipo:
          true,

        usuario_reporta:
          true,

      },

      order: {
        id: 'DESC',
      },

    });
  }

  async findByTraslado(
    trasladoId: number,
    userId: number,
    role: JwtRole,
  ) {

    const traslado =
      await this.trasladoRepository.findOne({

        where: {
          id: trasladoId,
        },

        relations: {
          conductor: true,
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
        'No puedes consultar las incidencias de otro conductor',
      );

    }

    return this.incidenciaRepository.find({

      where: {

        traslado: {
          id: trasladoId,
        },

      },

      relations: {

        traslado: {

          ruta:
            true,

          vehiculo:
            true,

          conductor:
            true,

        },

        tipo:
          true,

        usuario_reporta:
          true,

      },

      order: {
        created_at: 'DESC',
      },

    });
  }

  async findOne(
    id: number,
    userId: number,
    role: JwtRole,
  ) {

    const incidencia =
      await this.incidenciaRepository.findOne({

        where: {
          id: id,
        },

        relations: {

          traslado: {

            ruta:
              true,

            vehiculo:
              true,

            conductor:
              true,

          },

          tipo:
            true,

          usuario_reporta:
            true,

        },

      });

    if (!incidencia) {

      throw new NotFoundException(
        'La incidencia no existe',
      );

    }

    if (
      role ===
        JwtRole.MOVILIDAD &&
      incidencia.traslado
        .conductor.id !==
        userId
    ) {

      throw new ForbiddenException(
        'No puedes consultar esta incidencia',
      );

    }

    return incidencia;
  }

}