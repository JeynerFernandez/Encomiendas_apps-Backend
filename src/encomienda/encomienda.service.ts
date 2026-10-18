import {
  BadRequestException,
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
  hash,
} from 'bcrypt';

import {
  randomBytes,
  randomInt,
} from 'node:crypto';

import {
  Encomienda,
} from './encomienda.entity.js';

import {
  EncomiendaEstado,
} from './encomienda-estado.enum.js';

import {
  Persona,
} from '../personas/persona.entity.js';

import {
  Sede,
} from '../sedes/sede.entity.js';

import {
  User,
} from '../users/user.entity.js';

import {
  TarifasService,
} from '../tarifas/tarifas.service.js';

import {
  HistorialEncomiendaService,
} from '../historial-encomienda/historial-encomienda.service.js';

import {
  PagosService,
} from '../pagos/pagos.service.js';

import {
  CreateEncomiendaDto,
} from './dto/create-encomienda.dto.js';

import {
  UpdateEncomiendaDto,
} from './dto/update-encomienda.dto.js';

@Injectable()
export class EncomiendaService {

  constructor(

    @InjectRepository(Encomienda)
    private encomiendaRepository:
      Repository<Encomienda>,

    @InjectRepository(Persona)
    private personaRepository:
      Repository<Persona>,

    @InjectRepository(Sede)
    private sedeRepository:
      Repository<Sede>,

    @InjectRepository(User)
    private userRepository:
      Repository<User>,

    private tarifasService:
      TarifasService,

    private historialService:
      HistorialEncomiendaService,

    private pagosService:
      PagosService,

  ) {}

  async create(
    encomienda: CreateEncomiendaDto,
    userId: number,
  ) {

    const remitente =
      await this.findPersona(
        encomienda.remitenteId,
      );

    const destinatario =
      await this.findPersona(
        encomienda.destinatarioId,
      );

    const origen =
      await this.findSede(
        encomienda.sedeOrigenId,
      );

    const destino =
      await this.findSede(
        encomienda.sedeDestinoId,
      );

    if (
      origen.id ===
      destino.id
    ) {

      throw new BadRequestException(
        'La sede de origen y destino no pueden ser iguales',
      );

    }

    const usuario =
      await this.userRepository.findOneBy({
        id: userId,
        active: true,
      });

    if (!usuario) {

      throw new NotFoundException(
        'El usuario que registra la encomienda no existe',
      );

    }

    const tarifa =
      await this.tarifasService
        .findBySedes(
          origen.id,
          destino.id,
        );

    const costoTotal =
      this.calcularCosto(
        encomienda.peso_kg,
        Number(
          tarifa.precio_base,
        ),
        Number(
          tarifa.precio_kg_excedente,
        ),
      );

    const codigoRastreo =
      await this.generarCodigoRastreo();

    const claveRastreo =
      randomInt(
        1000,
        10000,
      ).toString();

    const claveHash =
      await hash(
        claveRastreo,
        10,
      );

    const newEncomienda =
      this.encomiendaRepository.create({

        codigo_rastreo:
          codigoRastreo,

        clave_rastreo_hash:
          claveHash,

        remitente:
          remitente,

        destinatario:
          destinatario,

        sede_origen:
          origen,

        sede_destino:
          destino,

        ultima_sede:
          origen,

        usuario_registra:
          usuario,

        alto_cm:
          encomienda.alto_cm,

        ancho_cm:
          encomienda.ancho_cm,

        largo_cm:
          encomienda.largo_cm,

        peso_kg:
          encomienda.peso_kg,

        costo_total:
          costoTotal,

        estado:
          EncomiendaEstado.REGISTRADO,

        observacion:
          encomienda.observacion ??
          null,

        entregado_at:
          null,

      });

    const encomiendaSaved =
      await this.encomiendaRepository.save(
        newEncomienda,
      );

    await this.historialService
      .registrarCambio(
        encomiendaSaved,
        EncomiendaEstado.REGISTRADO,
        origen,
      );

    const pagoSaved =
      await this.pagosService
        .crearParaEncomienda(
          encomiendaSaved,
          {
            modalidad:
              encomienda.modalidad_pago,
          },
        );

    return {

      encomienda: {

        id:
          encomiendaSaved.id,

        codigo_rastreo:
          encomiendaSaved.codigo_rastreo,

        costo_total:
          encomiendaSaved.costo_total,

        estado:
          encomiendaSaved.estado,

        remitente: {

          dni:
            remitente.dni,

          nombres:
            remitente.nombres,

          apellidos:
            `${remitente.apellido_paterno} ${remitente.apellido_materno}`,

        },

        destinatario: {

          dni:
            destinatario.dni,

          nombres:
            destinatario.nombres,

          apellidos:
            `${destinatario.apellido_paterno} ${destinatario.apellido_materno}`,

        },

        origen:
          origen.name,

        destino:
          destino.name,

      },

      pago: {

        id:
          pagoSaved.id,

        modalidad:
          pagoSaved.modalidad,

        estado:
          pagoSaved.estado,

        monto:
          pagoSaved.monto,

      },

      clave_rastreo:
        claveRastreo,

    };
  }

  findAll() {

    return this.encomiendaRepository.find({

      relations: {

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

        pago:
          true,

      },

      order: {
        id: 'DESC',
      },

    });
  }

  async findOne(
    id: number,
  ) {

    const encomiendaFound =
      await this.encomiendaRepository.findOne({

        where: {
          id: id,
        },

        relations: {

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

          pago:
            true,

        },

      });

    if (!encomiendaFound) {

      throw new NotFoundException(
        'La encomienda no existe',
      );

    }

    return encomiendaFound;
  }

  async update(
    id: number,
    encomienda: UpdateEncomiendaDto,
  ) {

    const encomiendaFound =
      await this.findOne(
        id,
      );

    if (
      encomiendaFound.estado !==
      EncomiendaEstado.REGISTRADO
    ) {

      throw new BadRequestException(
        'Solo se puede editar una encomienda que se encuentre registrada',
      );

    }

    await this.pagosService
      .validarEditable(
        id,
      );

    if (
      encomienda.remitenteId !==
      undefined
    ) {

      encomiendaFound.remitente =
        await this.findPersona(
          encomienda.remitenteId,
        );

    }

    if (
      encomienda.destinatarioId !==
      undefined
    ) {

      encomiendaFound.destinatario =
        await this.findPersona(
          encomienda.destinatarioId,
        );

    }

    let origen =
      encomiendaFound.sede_origen;

    let destino =
      encomiendaFound.sede_destino;

    if (
      encomienda.sedeOrigenId !==
      undefined
    ) {

      origen =
        await this.findSede(
          encomienda.sedeOrigenId,
        );

      encomiendaFound.sede_origen =
        origen;

      encomiendaFound.ultima_sede =
        origen;

    }

    if (
      encomienda.sedeDestinoId !==
      undefined
    ) {

      destino =
        await this.findSede(
          encomienda.sedeDestinoId,
        );

      encomiendaFound.sede_destino =
        destino;

    }

    if (
      origen.id ===
      destino.id
    ) {

      throw new BadRequestException(
        'La sede de origen y destino no pueden ser iguales',
      );

    }

    if (
      encomienda.alto_cm !==
      undefined
    ) {

      encomiendaFound.alto_cm =
        encomienda.alto_cm;

    }

    if (
      encomienda.ancho_cm !==
      undefined
    ) {

      encomiendaFound.ancho_cm =
        encomienda.ancho_cm;

    }

    if (
      encomienda.largo_cm !==
      undefined
    ) {

      encomiendaFound.largo_cm =
        encomienda.largo_cm;

    }

    if (
      encomienda.peso_kg !==
      undefined
    ) {

      encomiendaFound.peso_kg =
        encomienda.peso_kg;

    }

    if (
      encomienda.observacion !==
      undefined
    ) {

      encomiendaFound.observacion =
        encomienda.observacion;

    }

    const tarifa =
      await this.tarifasService
        .findBySedes(
          origen.id,
          destino.id,
        );

    encomiendaFound.costo_total =
      this.calcularCosto(
        Number(
          encomiendaFound.peso_kg,
        ),
        Number(
          tarifa.precio_base,
        ),
        Number(
          tarifa.precio_kg_excedente,
        ),
      );

    const encomiendaSaved =
      await this.encomiendaRepository.save(
        encomiendaFound,
      );

    await this.pagosService
      .actualizarPagoPendiente(
        encomiendaSaved,
        encomienda.modalidad_pago,
      );

    return this.findOne(
      encomiendaSaved.id,
    );
  }

  async ingresarAlmacenPorCodigo(
  codigoRastreo: string,
  sedeIdUsuario: number | null,
) {

  if (
    sedeIdUsuario === null
  ) {

    throw new BadRequestException(
      'El usuario de almacén no tiene una sede asignada',
    );

  }

  const codigo =
    codigoRastreo
      .trim()
      .toUpperCase();

  const encomienda =
    await this.encomiendaRepository.findOne({

      where: {
        codigo_rastreo: codigo,
      },

      relations: {

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
      'No existe una encomienda con ese código de rastreo',
    );

  }

  if (
    encomienda.estado !==
      EncomiendaEstado.REGISTRADO &&
    encomienda.estado !==
      EncomiendaEstado.CAMINO_ALMACEN
  ) {

    throw new BadRequestException(
      'La encomienda no puede ingresar al almacén en su estado actual',
    );

  }

  if (
    encomienda.sede_origen.id !==
    sedeIdUsuario
  ) {

    throw new BadRequestException(
      'La encomienda no pertenece a esta sede',
    );

  }

  await this.pagosService
    .validarPagoOrigen(
      encomienda.id,
    );

  const sede =
    await this.findSede(
      sedeIdUsuario,
    );

  encomienda.estado =
    EncomiendaEstado.EN_ALMACEN;

  encomienda.ultima_sede =
    sede;

  const encomiendaSaved =
    await this.encomiendaRepository.save(
      encomienda,
    );

  await this.historialService
    .registrarCambio(
      encomiendaSaved,
      EncomiendaEstado.EN_ALMACEN,
      sede,
    );

  return {

    message:
      'Encomienda ingresada al almacén correctamente',

    encomienda: {

      id:
        encomiendaSaved.id,

      codigo_rastreo:
        encomiendaSaved.codigo_rastreo,

      estado:
        encomiendaSaved.estado,

      sede_actual: {

        id:
          sede.id,

        name:
          sede.name,

      },

    },

  };
}

  private async findPersona(
    id: number,
  ) {

    const persona =
      await this.personaRepository.findOneBy({
        id: id,
      });

    if (!persona) {

      throw new NotFoundException(
        'La persona no existe',
      );

    }

    return persona;
  }

  private async findSede(
    id: number,
  ) {

    const sede =
      await this.sedeRepository.findOneBy({
        id: id,
        active: true,
      });

    if (!sede) {

      throw new NotFoundException(
        'La sede no existe o está inactiva',
      );

    }

    return sede;
  }

  private calcularCosto(
    peso: number,
    precioBase: number,
    precioKgExcedente: number,
  ) {

    const KG_INCLUIDOS =
      20;

    let total =
      precioBase;

    if (
      peso >
      KG_INCLUIDOS
    ) {

      const exceso =
        peso -
        KG_INCLUIDOS;

      total +=
        exceso *
        precioKgExcedente;

    }

    return Number(
      total.toFixed(2),
    );
  }

  private async generarCodigoRastreo() {

    let codigo:
      string;

    let existe:
      Encomienda | null;

    do {

      codigo =
        'MY-' +
        randomBytes(4)
          .toString('hex')
          .toUpperCase();

      existe =
        await this.encomiendaRepository
          .findOneBy({

            codigo_rastreo:
              codigo,

          });

    } while (existe);

    return codigo;
  }

}