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
  Pago,
  PagoEstado,
  PagoModalidad,
} from './pago.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  EncomiendaEstado,
} from '../encomienda/encomienda-estado.enum.js';

import {
  CreatePagoDto,
} from './dto/create-pago.dto.js';

import {
  UpdatePagoDto,
} from './dto/update-pago.dto.js';

@Injectable()
export class PagosService {

  constructor(

    @InjectRepository(Pago)
    private pagoRepository:
      Repository<Pago>,

  ) {}

  async crearParaEncomienda(
    encomienda: Encomienda,
    pago: CreatePagoDto,
  ) {

    const pagoExist =
      await this.pagoRepository.findOne({
        where: {
          encomienda: {
            id: encomienda.id,
          },
        },
      });

    if (pagoExist) {

      throw new ConflictException(
        'La encomienda ya tiene un pago registrado',
      );

    }

    const newPago =
      this.pagoRepository.create({

        encomienda:
          encomienda,

        modalidad:
          pago.modalidad,

        estado:
          PagoEstado.PENDIENTE,

        monto:
          Number(
            encomienda.costo_total,
          ),

        pagado_at:
          null,

      });

    return this.pagoRepository.save(
      newPago,
    );
  }

  findAll() {

    return this.pagoRepository.find({

      relations: {

        encomienda: {

          sede_origen:
            true,

          sede_destino:
            true,

          remitente:
            true,

          destinatario:
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

    const pago =
      await this.pagoRepository.findOne({

        where: {
          id: id,
        },

        relations: {

          encomienda: {

            sede_origen:
              true,

            sede_destino:
              true,

            remitente:
              true,

            destinatario:
              true,

          },

        },

      });

    if (!pago) {

      throw new NotFoundException(
        'El pago no existe',
      );

    }

    return pago;
  }

  async findByEncomienda(
    encomiendaId: number,
  ) {

    const pago =
      await this.pagoRepository.findOne({

        where: {

          encomienda: {
            id: encomiendaId,
          },

        },

        relations: {

          encomienda: {

            sede_origen:
              true,

            sede_destino:
              true,

          },

        },

      });

    if (!pago) {

      throw new NotFoundException(
        'La encomienda no tiene un pago registrado',
      );

    }

    return pago;
  }

  async updateModalidad(
    encomiendaId: number,
    pago: UpdatePagoDto,
    sedeIdUsuario: number | null,
  ) {

    if (
      sedeIdUsuario === null
    ) {

      throw new ForbiddenException(
        'El usuario de recepción no tiene una sede asignada',
      );

    }

    const pagoFound =
      await this.findByEncomienda(
        encomiendaId,
      );

    if (
      pagoFound.estado ===
      PagoEstado.PAGADO
    ) {

      throw new BadRequestException(
        'No se puede modificar la modalidad de un pago realizado',
      );

    }

    if (
      pagoFound.encomienda.estado !==
      EncomiendaEstado.REGISTRADO
    ) {

      throw new BadRequestException(
        'Solo se puede modificar la modalidad mientras la encomienda esté registrada',
      );

    }

    if (
      pagoFound.encomienda
        .sede_origen.id !==
      sedeIdUsuario
    ) {

      throw new ForbiddenException(
        'La encomienda no pertenece a esta sede de origen',
      );

    }

    if (
      pago.modalidad !==
      undefined
    ) {

      pagoFound.modalidad =
        pago.modalidad;

    }

    return this.pagoRepository.save(
      pagoFound,
    );
  }

  async pagar(
    encomiendaId: number,
    sedeIdUsuario: number | null,
  ) {

    if (
      sedeIdUsuario === null
    ) {

      throw new ForbiddenException(
        'El usuario de recepción no tiene una sede asignada',
      );

    }

    const pago =
      await this.findByEncomienda(
        encomiendaId,
      );

    if (
      pago.encomienda.estado ===
      EncomiendaEstado.CANCELADO
    ) {

      throw new BadRequestException(
        'No se puede pagar una encomienda cancelada',
      );

    }

    if (
      pago.estado ===
      PagoEstado.PAGADO
    ) {

      throw new BadRequestException(
        'La encomienda ya se encuentra pagada',
      );

    }

    if (
      pago.modalidad ===
      PagoModalidad.ORIGEN
    ) {

      if (
        pago.encomienda.sede_origen.id !==
        sedeIdUsuario
      ) {

        throw new ForbiddenException(
          'El pago debe realizarse en la sede de origen',
        );

      }

      if (
        pago.encomienda.estado !==
          EncomiendaEstado.REGISTRADO &&
        pago.encomienda.estado !==
          EncomiendaEstado.CAMINO_ALMACEN
      ) {

        throw new BadRequestException(
          'El pago en origen debe realizarse antes de ingresar al almacén',
        );

      }

    }

    if (
      pago.modalidad ===
      PagoModalidad.DESTINO
    ) {

      if (
        pago.encomienda.sede_destino.id !==
        sedeIdUsuario
      ) {

        throw new ForbiddenException(
          'El pago debe realizarse en la sede de destino',
        );

      }

      if (
        pago.encomienda.estado !==
        EncomiendaEstado.EN_SEDE_DESTINO
      ) {

        throw new BadRequestException(
          'La encomienda todavía no se encuentra en la sede destino',
        );

      }

    }

    pago.estado =
      PagoEstado.PAGADO;

    pago.pagado_at =
      new Date();

    return this.pagoRepository.save(
      pago,
    );
  }

  async validarPagoOrigen(
    encomiendaId: number,
  ) {

    const pago =
      await this.findByEncomienda(
        encomiendaId,
      );

    if (
      pago.modalidad ===
        PagoModalidad.ORIGEN &&
      pago.estado !==
        PagoEstado.PAGADO
    ) {

      throw new BadRequestException(
        'La encomienda debe ser pagada en origen antes de ingresar al almacén',
      );

    }

    return true;
  }

  async validarPagoRealizado(
    encomiendaId: number,
  ) {

    const pago =
      await this.findByEncomienda(
        encomiendaId,
      );

    if (
      pago.estado !==
      PagoEstado.PAGADO
    ) {

      throw new BadRequestException(
        'La encomienda tiene un pago pendiente',
      );

    }

    return true;
  }

  async validarEditable(
    encomiendaId: number,
  ) {

    const pago =
      await this.findByEncomienda(
        encomiendaId,
      );

    if (
      pago.estado ===
      PagoEstado.PAGADO
    ) {

      throw new BadRequestException(
        'No se puede modificar una encomienda que ya fue pagada',
      );

    }

    return true;
  }

  async actualizarPagoPendiente(
    encomienda: Encomienda,
    modalidad?: PagoModalidad,
  ) {

    const pago =
      await this.findByEncomienda(
        encomienda.id,
      );

    if (
      pago.estado ===
      PagoEstado.PAGADO
    ) {

      throw new BadRequestException(
        'No se puede modificar un pago realizado',
      );

    }

    pago.monto =
      Number(
        encomienda.costo_total,
      );

    if (
      modalidad !==
      undefined
    ) {

      pago.modalidad =
        modalidad;

    }

    return this.pagoRepository.save(
      pago,
    );
  }

}