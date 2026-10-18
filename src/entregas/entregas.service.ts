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
  Repository,
} from 'typeorm';

import {
  compare,
} from 'bcrypt';

import {
  Entrega,
} from './entrega.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  EncomiendaEstado,
} from '../encomienda/encomienda-estado.enum.js';
import {
  User,
} from '../users/user.entity.js';

import {
  JwtRole,
} from '../auth/jwt/jwt-role.js';

import {
  PagosService,
} from '../pagos/pagos.service.js';

import {
  HistorialEncomiendaService,
} from '../historial-encomienda/historial-encomienda.service.js';

import {
  CreateEntregaDto,
} from './dto/create-entrega.dto.js';

@Injectable()
export class EntregasService {

  constructor(

    @InjectRepository(Entrega)
    private entregaRepository:
      Repository<Entrega>,

    @InjectRepository(Encomienda)
    private encomiendaRepository:
      Repository<Encomienda>,

    @InjectRepository(User)
    private userRepository:
      Repository<User>,

    private pagosService:
      PagosService,

    private historialService:
      HistorialEncomiendaService,

  ) {}

  findAll() {

    return this.entregaRepository.find({

      relations: {

        encomienda: {

          remitente:
            true,

          destinatario:
            true,

          sede_origen:
            true,

          sede_destino:
            true,

        },

        usuario_entrega: {
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

    const entrega =
      await this.entregaRepository.findOne({

        where: {
          id: id,
        },

        relations: {

          encomienda: {

            remitente:
              true,

            destinatario:
              true,

            sede_origen:
              true,

            sede_destino:
              true,

          },

          usuario_entrega: {
            role: true,
          },

        },

      });

    if (!entrega) {

      throw new NotFoundException(
        'La entrega no existe',
      );

    }

    return entrega;
  }

  async findByEncomienda(
    encomiendaId: number,
  ) {

    const entrega =
      await this.entregaRepository.findOne({

        where: {

          encomienda: {
            id: encomiendaId,
          },

        },

        relations: {

          encomienda: {

            remitente:
              true,

            destinatario:
              true,

            sede_origen:
              true,

            sede_destino:
              true,

          },

          usuario_entrega: {
            role: true,
          },

        },

      });

    if (!entrega) {

      throw new NotFoundException(
        'La encomienda todavía no tiene una entrega registrada',
      );

    }

    return entrega;
  }

  async entregar(
    encomiendaId: number,
    entrega: CreateEntregaDto,
    userId: number,
    sedeIdUsuario: number | null,
  ) {

    if (
      sedeIdUsuario === null
    ) {

      throw new ForbiddenException(
        'El usuario de recepción no tiene una sede asignada',
      );

    }

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
        'El usuario que realiza la entrega no existe o está inactivo',
      );

    }

    if (
      usuario.role.name !==
      JwtRole.RECEPCION
    ) {

      throw new ForbiddenException(
        'El usuario no tiene permiso para realizar entregas',
      );

    }

    const encomienda =
      await this.encomiendaRepository.findOne({

        where: {
          id: encomiendaId,
        },

        relations: {

          destinatario:
            true,

          sede_origen:
            true,

          sede_destino:
            true,

          ultima_sede:
            true,

        },

      });

    if (!encomienda) {

      throw new NotFoundException(
        'La encomienda no existe',
      );

    }

    if (
      encomienda.estado ===
      EncomiendaEstado.ENTREGADO
    ) {

      throw new ConflictException(
        'La encomienda ya fue entregada',
      );

    }

    if (
      encomienda.estado !==
      EncomiendaEstado.EN_SEDE_DESTINO
    ) {

      throw new BadRequestException(
        'La encomienda todavía no se encuentra disponible para entrega',
      );

    }

    if (
      encomienda.sede_destino.id !==
      sedeIdUsuario
    ) {

      throw new ForbiddenException(
        'La encomienda no pertenece a esta sede de destino',
      );

    }

    if (
      !encomienda.ultima_sede ||
      encomienda.ultima_sede.id !==
        encomienda.sede_destino.id
    ) {

      throw new BadRequestException(
        'La encomienda todavía no ha sido registrada físicamente en la sede destino',
      );

    }

    const entregaExist =
      await this.entregaRepository.findOne({

        where: {

          encomienda: {
            id: encomienda.id,
          },

        },

      });

    if (entregaExist) {

      throw new ConflictException(
        'La encomienda ya tiene una entrega registrada',
      );

    }

    await this.pagosService
      .validarPagoRealizado(
        encomienda.id,
      );

    if (
      entrega.dni !==
      encomienda.destinatario.dni
    ) {

      throw new BadRequestException(
        'El DNI ingresado no corresponde al destinatario de la encomienda',
      );

    }

    const claveCorrecta =
      await compare(
        entrega.clave,
        encomienda.clave_rastreo_hash,
      );

    if (!claveCorrecta) {

      throw new BadRequestException(
        'La clave de entrega es incorrecta',
      );

    }

    const fechaEntrega =
      new Date();

    const newEntrega =
      this.entregaRepository.create({

        encomienda:
          encomienda,

        usuario_entrega:
          usuario,

        dni_receptor:
          entrega.dni,

        entregado_at:
          fechaEntrega,

      });

    const entregaSaved =
      await this.entregaRepository.save(
        newEntrega,
      );

    encomienda.estado =
      EncomiendaEstado.ENTREGADO;

    encomienda.entregado_at =
      fechaEntrega;

    encomienda.ultima_sede =
      encomienda.sede_destino;

    const encomiendaSaved =
      await this.encomiendaRepository.save(
        encomienda,
      );

    await this.historialService
      .registrarCambio(
        encomiendaSaved,
        EncomiendaEstado.ENTREGADO,
        encomienda.sede_destino,
      );

    return {

      message:
        'Encomienda entregada correctamente',

      entrega: {

        id:
          entregaSaved.id,

        encomienda_id:
          encomiendaSaved.id,

        codigo_rastreo:
          encomiendaSaved.codigo_rastreo,

        estado:
          encomiendaSaved.estado,

        dni_receptor:
          entregaSaved.dni_receptor,

        sede:
          encomiendaSaved
            .sede_destino.name,

        entregado_at:
          entregaSaved.entregado_at,

        entregado_por: {
          id:
            usuario.id,

          nombre:
            usuario.name,
        },

      },

    };
  }

}