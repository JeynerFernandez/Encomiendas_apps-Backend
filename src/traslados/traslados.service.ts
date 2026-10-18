import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  In,
  IsNull,
  Repository,
} from 'typeorm';

import {
  Traslado,
  TrasladoEstado,
} from './traslado.entity.js';

import {
  Ruta,
} from '../rutas/ruta.entity.js';

import {
  Vehiculo,
} from '../vehiculos/vehiculo.entity.js';

import {
  User,
} from '../users/user.entity.js';

import {
  JwtRole,
} from '../auth/jwt/jwt-role.js';

import {
  CreateTrasladoDto,
} from './dto/create-traslado.dto.js';

import {
  UpdateTrasladoDto,
} from './dto/update-traslado.dto.js';

import {
  TrasladoEncomienda,
} from '../traslado-encomienda/traslado-encomienda.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  EncomiendaEstado,
} from '../encomienda/encomienda-estado.enum.js';

import {
  HistorialEncomiendaService,
} from '../historial-encomienda/historial-encomienda.service.js';

@Injectable()
export class TrasladosService {

  constructor(

    @InjectRepository(Traslado)
    private trasladoRepository:
      Repository<Traslado>,

    @InjectRepository(Ruta)
    private rutaRepository:
      Repository<Ruta>,

    @InjectRepository(Vehiculo)
    private vehiculoRepository:
      Repository<Vehiculo>,

    @InjectRepository(User)
    private userRepository:
      Repository<User>,

    @InjectRepository(
      TrasladoEncomienda,
    )
    private trasladoEncomiendaRepository:
      Repository<TrasladoEncomienda>,

    @InjectRepository(
      Encomienda,
    )
    private encomiendaRepository:
      Repository<Encomienda>,

    private historialService:
      HistorialEncomiendaService,

  ) {}

  async create(
    traslado: CreateTrasladoDto,
  ) {

    const ruta =
      await this.rutaRepository.findOneBy({
        id: traslado.rutaId,
        active: true,
      });

    if (!ruta) {

      throw new NotFoundException(
        'La ruta no existe o está inactiva',
      );

    }

    const vehiculo =
      await this.vehiculoRepository.findOneBy({
        id: traslado.vehiculoId,
        active: true,
      });

    if (!vehiculo) {

      throw new NotFoundException(
        'El vehículo no existe o está inactivo',
      );

    }

    const conductor =
      await this.userRepository.findOne({
        where: {
          id: traslado.conductorId,
          active: true,
        },
        relations: {
          role: true,
        },
      });

    if (!conductor) {

      throw new NotFoundException(
        'El conductor no existe o está inactivo',
      );

    }

    if (
      conductor.role.name !==
      JwtRole.MOVILIDAD
    ) {

      throw new BadRequestException(
        'El usuario seleccionado no tiene el rol MOVILIDAD',
      );

    }

    await this.validateVehiculoDisponible(
      vehiculo.id,
    );

    await this.validateConductorDisponible(
      conductor.id,
    );

    const newTraslado =
      this.trasladoRepository.create({

        ruta:
          ruta,

        vehiculo:
          vehiculo,

        conductor:
          conductor,

        estado:
          TrasladoEstado.PROGRAMADO,

        salida_at:
          null,

        llegada_at:
          null,

      });

    return this.trasladoRepository.save(
      newTraslado,
    );
  }

  findAll() {

    return this.trasladoRepository.find({
      relations: {

        ruta: true,

        vehiculo: true,

        conductor: {
          role: true,
        },

      },

      order: {
        id: 'DESC',
      },
    });

  }

  async findOne(
    id: number,
  ) {

    const trasladoFound =
      await this.trasladoRepository.findOne({
        where: {
          id: id,
        },

        relations: {

          ruta: true,

          vehiculo: true,

          conductor: {
            role: true,
          },

        },
      });

    if (!trasladoFound) {

      throw new NotFoundException(
        'El traslado no existe',
      );

    }

    return trasladoFound;
  }

  async update(
    id: number,
    traslado: UpdateTrasladoDto,
  ) {

    const trasladoFound =
      await this.findOne(
        id,
      );

    if (
      trasladoFound.estado !==
      TrasladoEstado.PROGRAMADO
    ) {

      throw new BadRequestException(
        'Solo se puede modificar un traslado programado',
      );

    }

    if (
      traslado.rutaId !==
      undefined
    ) {

      const ruta =
        await this.rutaRepository.findOneBy({
          id: traslado.rutaId,
          active: true,
        });

      if (!ruta) {

        throw new NotFoundException(
          'La ruta no existe o está inactiva',
        );

      }

      trasladoFound.ruta =
        ruta;

    }

    if (
      traslado.vehiculoId !==
      undefined
    ) {

      const vehiculo =
        await this.vehiculoRepository.findOneBy({
          id: traslado.vehiculoId,
          active: true,
        });

      if (!vehiculo) {

        throw new NotFoundException(
          'El vehículo no existe o está inactivo',
        );

      }

      await this.validateVehiculoDisponible(
        vehiculo.id,
        id,
      );

      trasladoFound.vehiculo =
        vehiculo;

    }

    if (
      traslado.conductorId !==
      undefined
    ) {

      const conductor =
        await this.userRepository.findOne({
          where: {
            id: traslado.conductorId,
            active: true,
          },

          relations: {
            role: true,
          },
        });

      if (!conductor) {

        throw new NotFoundException(
          'El conductor no existe o está inactivo',
        );

      }

      if (
        conductor.role.name !==
        JwtRole.MOVILIDAD
      ) {

        throw new BadRequestException(
          'El usuario seleccionado no tiene el rol MOVILIDAD',
        );

      }

      await this.validateConductorDisponible(
        conductor.id,
        id,
      );

      trasladoFound.conductor =
        conductor;

    }

    return this.trasladoRepository.save(
      trasladoFound,
    );
  }

  async iniciar(
    id: number,
    userId: number,
  ) {

    const traslado =
      await this.findOne(
        id,
      );

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
      TrasladoEstado.PROGRAMADO
    ) {

      throw new BadRequestException(
        'El traslado no se encuentra programado',
      );

    }

    const detalles =
      await this
        .trasladoEncomiendaRepository
        .find({

          where: {

            traslado: {
              id: traslado.id,
            },

            descargado_at:
              IsNull(),

          },

          relations: {

            encomienda: {
              ultima_sede: true,
              sede_destino: true,
            },

          },

        });

    if (
      detalles.length === 0
    ) {

      throw new BadRequestException(
        'El traslado no tiene encomiendas asignadas',
      );

    }

    for (
      const detalle of detalles
    ) {

      if (
        detalle.encomienda.estado !==
        EncomiendaEstado.EN_ALMACEN
      ) {

        throw new BadRequestException(
          `La encomienda ${detalle.encomienda.codigo_rastreo} no se encuentra en almacén`,
        );

      }

    }

    traslado.estado =
      TrasladoEstado.EN_CURSO;

    traslado.salida_at =
      new Date();

    await this.trasladoRepository.save(
      traslado,
    );

    for (
      const detalle of detalles
    ) {

      detalle.encomienda.estado =
        EncomiendaEstado.EN_TRANSITO;

    }

    const encomiendas =
      detalles.map(
        (detalle) =>
          detalle.encomienda,
      );

    await this.encomiendaRepository.save(
      encomiendas,
    );

    await Promise.all(

      encomiendas.map(
        (encomienda) =>

          this.historialService
            .registrarCambio(

              encomienda,

              EncomiendaEstado
                .EN_TRANSITO,

              encomienda.ultima_sede,

            ),
      ),

    );

    return this.findOne(
      id,
    );
  }

  async finalizar(
    id: number,
    userId: number,
  ) {

    const traslado =
      await this.findOne(
        id,
      );

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
        'El traslado no se encuentra en curso',
      );

    }

    const encomiendasPendientes =
      await this
        .trasladoEncomiendaRepository
        .count({

          where: {

            traslado: {
              id: traslado.id,
            },

            descargado_at:
              IsNull(),

          },

        });

    if (
      encomiendasPendientes > 0
    ) {

      throw new BadRequestException(
        'No se puede finalizar el traslado porque todavía existen encomiendas pendientes de descargar',
      );

    }

    traslado.estado =
      TrasladoEstado.FINALIZADO;

    traslado.llegada_at =
      new Date();

    return this.trasladoRepository.save(
      traslado,
    );
  }

  async cancelar(
    id: number,
  ) {

    const traslado =
      await this.findOne(
        id,
      );

    if (
      traslado.estado !==
      TrasladoEstado.PROGRAMADO
    ) {

      throw new BadRequestException(
        'Solo se puede cancelar un traslado programado',
      );

    }

    const detalles =
      await this
        .trasladoEncomiendaRepository
        .find({

          where: {
            traslado: {
              id: traslado.id,
            },
          },

        });

    if (
      detalles.length > 0
    ) {

      await this
        .trasladoEncomiendaRepository
        .remove(
          detalles,
        );

    }

    traslado.estado =
      TrasladoEstado.CANCELADO;

    return this.trasladoRepository.save(
      traslado,
    );
  }

  private async validateVehiculoDisponible(
    vehiculoId: number,
    trasladoId?: number,
  ) {

    const trasladoExist =
      await this.trasladoRepository.findOne({

        where: {

          vehiculo: {
            id: vehiculoId,
          },

          estado: In([
            TrasladoEstado.PROGRAMADO,
            TrasladoEstado.EN_CURSO,
          ]),

        },

      });

    if (
      trasladoExist &&
      trasladoExist.id !==
        trasladoId
    ) {

      throw new ConflictException(
        'El vehículo ya está asignado a otro traslado activo',
      );

    }
  }

  private async validateConductorDisponible(
    conductorId: number,
    trasladoId?: number,
  ) {

    const trasladoExist =
      await this.trasladoRepository.findOne({

        where: {

          conductor: {
            id: conductorId,
          },

          estado: In([
            TrasladoEstado.PROGRAMADO,
            TrasladoEstado.EN_CURSO,
          ]),

        },

      });

    if (
      trasladoExist &&
      trasladoExist.id !==
        trasladoId
    ) {

      throw new ConflictException(
        'El conductor ya está asignado a otro traslado activo',
      );

    }
  }

}