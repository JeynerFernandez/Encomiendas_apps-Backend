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
  IsNull,
  Repository,
} from 'typeorm';

import {
  Traslado,
  TrasladoEstado,
} from '../traslados/traslado.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  EncomiendaEstado,
} from '../encomienda/encomienda-estado.enum.js';

import {
  Sede,
} from '../sedes/sede.entity.js';

import {
  TrasladoEncomienda,
} from './traslado-encomienda.entity.js';

import {
  CreateTrasladoEncomiendaDto,
} from './dto/create-traslado-encomienda.dto.js';

@Injectable()
export class TrasladoEncomiendaService {

  constructor(

    @InjectRepository(
      TrasladoEncomienda,
    )
    private detalleRepository:
      Repository<TrasladoEncomienda>,

    @InjectRepository(
      Traslado,
    )
    private trasladoRepository:
      Repository<Traslado>,

    @InjectRepository(
      Encomienda,
    )
    private encomiendaRepository:
      Repository<Encomienda>,

    @InjectRepository(
      Sede,
    )
    private sedeRepository:
      Repository<Sede>,

  ) {}

  async create(
    detalle:
      CreateTrasladoEncomiendaDto,

    sedeIdUsuario: number | null,
  ) {

    if (
      sedeIdUsuario === null
    ) {

      throw new ForbiddenException(
        'El usuario de almacén no tiene una sede asignada',
      );

    }

    const traslado =
      await this.trasladoRepository.findOne({

        where: {
          id: detalle.trasladoId,
        },

        relations: {

          ruta: {

            sedes: {
              sede: true,
            },

          },

        },

      });

    if (!traslado) {

      throw new NotFoundException(
        'El traslado no existe',
      );

    }

    if (
      traslado.estado !==
      TrasladoEstado.PROGRAMADO
    ) {

      throw new BadRequestException(
        'Solo se pueden asignar encomiendas a un traslado programado',
      );

    }

    const encomienda =
      await this.encomiendaRepository.findOne({

        where: {
          id: detalle.encomiendaId,
        },

        relations: {

          ultima_sede:
            true,

          sede_origen:
            true,

          sede_destino:
            true,

        },

      });

    if (!encomienda) {

      throw new NotFoundException(
        'La encomienda no existe',
      );

    }

    if (
      encomienda.estado !==
      EncomiendaEstado.EN_ALMACEN
    ) {

      throw new BadRequestException(
        'La encomienda debe encontrarse en almacén',
      );

    }

    if (
      !encomienda.ultima_sede
    ) {

      throw new BadRequestException(
        'La encomienda no tiene una sede actual registrada',
      );

    }

    if (
      encomienda.ultima_sede.id !==
      sedeIdUsuario
    ) {

      throw new ForbiddenException(
        'La encomienda no pertenece a la sede de este almacén',
      );

    }

    const sedeUsuarioEnRuta =
      traslado.ruta.sedes.find(
        (item) =>
          item.sede.id ===
          sedeIdUsuario,
      );

    if (!sedeUsuarioEnRuta) {

      throw new BadRequestException(
        'La sede del almacén no pertenece a la ruta del traslado',
      );

    }

    const destinoEnRuta =
      traslado.ruta.sedes.find(
        (item) =>
          item.sede.id ===
          encomienda.sede_destino.id,
      );

    if (!destinoEnRuta) {

      throw new BadRequestException(
        'El destino de la encomienda no pertenece a la ruta del traslado',
      );

    }

    if (
      destinoEnRuta.orden <=
      sedeUsuarioEnRuta.orden
    ) {

      throw new BadRequestException(
        'El destino de la encomienda debe encontrarse después de la sede actual',
      );

    }

    const detalleExist =
      await this.detalleRepository.findOne({

        where: {

          traslado: {
            id: traslado.id,
          },

          encomienda: {
            id: encomienda.id,
          },

        },

      });

    if (detalleExist) {

      throw new ConflictException(
        'La encomienda ya está asignada a este traslado',
      );

    }

    const asignacionActiva =
      await this.detalleRepository.findOne({

        where: {

          encomienda: {
            id: encomienda.id,
          },

          descargado_at:
            IsNull(),

        },

        relations: {
          traslado: true,
        },

      });

    if (asignacionActiva) {

      throw new ConflictException(
        'La encomienda ya está asignada a otro traslado',
      );

    }

    const newDetalle =
      this.detalleRepository.create({

        traslado:
          traslado,

        encomienda:
          encomienda,

        descargado_at:
          null,

      });

    return this.detalleRepository.save(
      newDetalle,
    );
  }

  async findAll() {

    return this.detalleRepository.find({

      relations: {

        traslado: {

          ruta:
            true,

          vehiculo:
            true,

          conductor:
            true,

        },

        encomienda: {

          remitente:
            true,

          destinatario:
            true,

          sede_origen:
            true,

          sede_destino:
            true,

          ultima_sede:
            true,

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

    const detalle =
      await this.detalleRepository.findOne({

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

          encomienda: {

            remitente:
              true,

            destinatario:
              true,

            sede_origen:
              true,

            sede_destino:
              true,

            ultima_sede:
              true,

          },

        },

      });

    if (!detalle) {

      throw new NotFoundException(
        'La asignación no existe',
      );

    }

    return detalle;
  }

  async findByTraslado(
    trasladoId: number,
  ) {

    const traslado =
      await this.trasladoRepository.findOneBy({
        id: trasladoId,
      });

    if (!traslado) {

      throw new NotFoundException(
        'El traslado no existe',
      );

    }

    return this.detalleRepository.find({

      where: {

        traslado: {
          id: trasladoId,
        },

      },

      relations: {

        encomienda: {

          remitente:
            true,

          destinatario:
            true,

          sede_destino:
            true,

          ultima_sede:
            true,

        },

      },

      order: {
        id: 'ASC',
      },

    });
  }

  async findBySede(
    trasladoId: number,
    sedeId: number,
    conductorId: number,
  ) {

    const traslado =
      await this.trasladoRepository.findOne({

        where: {
          id: trasladoId,
        },

        relations: {

          conductor:
            true,

          ruta: {

            sedes: {
              sede: true,
            },

          },

          vehiculo:
            true,

        },

      });

    if (!traslado) {

      throw new NotFoundException(
        'El traslado no existe',
      );

    }

    if (
      traslado.conductor.id !==
      conductorId
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

    const sede =
      await this.sedeRepository.findOneBy({
        id: sedeId,
        active: true,
      });

    if (!sede) {

      throw new NotFoundException(
        'La sede no existe o está inactiva',
      );

    }

    const sedeEnRuta =
      traslado.ruta.sedes.find(
        (item) =>
          item.sede.id ===
          sede.id,
      );

    if (!sedeEnRuta) {

      throw new BadRequestException(
        'La sede seleccionada no pertenece a la ruta del traslado',
      );

    }

    const encomiendas =
      await this.detalleRepository.find({

        where: {

          traslado: {
            id: trasladoId,
          },

          encomienda: {

            sede_destino: {
              id: sedeId,
            },

          },

          descargado_at:
            IsNull(),

        },

        relations: {

          encomienda: {

            remitente:
              true,

            destinatario:
              true,

            sede_destino:
              true,

          },

        },

        order: {
          id: 'ASC',
        },

      });

    return {

      traslado: {

        id:
          traslado.id,

        vehiculo:
          traslado.vehiculo,

        estado:
          traslado.estado,

      },

      sede: {

        id:
          sede.id,

        name:
          sede.name,

      },

      cantidad:
        encomiendas.length,

      encomiendas:
        encomiendas.map(
          (detalle) => ({

            detalleId:
              detalle.id,

            encomiendaId:
              detalle.encomienda.id,

            codigo_rastreo:
              detalle.encomienda
                .codigo_rastreo,

            destinatario: {

              dni:
                detalle.encomienda
                  .destinatario.dni,

              nombres:
                detalle.encomienda
                  .destinatario.nombres,

              apellidos:
                `${detalle.encomienda.destinatario.apellido_paterno} ${detalle.encomienda.destinatario.apellido_materno}`,

            },

            destino:
              detalle.encomienda
                .sede_destino.name,

          }),
        ),

    };
  }

  async descargarPorSede(
    trasladoId: number,
    sedeId: number,
    conductorId: number,
  ) {

    const traslado =
      await this.trasladoRepository.findOne({

        where: {
          id: trasladoId,
        },

        relations: {

          conductor:
            true,

          ruta: {

            sedes: {
              sede: true,
            },

          },

        },

      });

    if (!traslado) {

      throw new NotFoundException(
        'El traslado no existe',
      );

    }

    if (
      traslado.conductor.id !==
      conductorId
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

    const sede =
      await this.sedeRepository.findOneBy({
        id: sedeId,
        active: true,
      });

    if (!sede) {

      throw new NotFoundException(
        'La sede no existe o está inactiva',
      );

    }

    const sedeEnRuta =
      traslado.ruta.sedes.find(
        (item) =>
          item.sede.id ===
          sede.id,
      );

    if (!sedeEnRuta) {

      throw new BadRequestException(
        'La sede seleccionada no pertenece a la ruta del traslado',
      );

    }

    const detalles =
      await this.detalleRepository.find({

        where: {

          traslado: {
            id: trasladoId,
          },

          encomienda: {

            sede_destino: {
              id: sedeId,
            },

          },

          descargado_at:
            IsNull(),

        },

        relations: {

          encomienda: {

            sede_destino:
              true,

            ultima_sede:
              true,

          },

        },

      });

    if (
      detalles.length === 0
    ) {

      throw new NotFoundException(
        'No hay encomiendas pendientes de descargar en esta sede',
      );

    }

    const fecha =
      new Date();

    for (
      const detalle of detalles
    ) {

      detalle.descargado_at =
        fecha;

      detalle.encomienda
        .ultima_sede =
        sede;

      detalle.encomienda
        .estado =
        EncomiendaEstado
          .EN_SEDE_DESTINO;

    }

    await this.encomiendaRepository.save(
      detalles.map(
        (detalle) =>
          detalle.encomienda,
      ),
    );

    await this.detalleRepository.save(
      detalles,
    );

    return {

      message:
        'Encomiendas descargadas correctamente',

      trasladoId:
        traslado.id,

      sede: {

        id:
          sede.id,

        name:
          sede.name,

      },

      cantidad_descargada:
        detalles.length,

      encomiendas:
        detalles.map(
          (detalle) => ({

            id:
              detalle.encomienda.id,

            codigo_rastreo:
              detalle.encomienda
                .codigo_rastreo,

            estado:
              detalle.encomienda
                .estado,

            descargado_at:
              detalle.descargado_at,

          }),
        ),

    };
  }

}