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
  compare,
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
import { TrasladoEstado } from '../traslados/traslado.entity.js';
import { TrasladoEncomienda } from '../traslado-encomienda/traslado-encomienda.entity.js';
import { RastrearEncomiendaDto } from './dto/rastrear-encomienda.dto.js';


@Injectable()
export class EncomiendaService {

  constructor(

    @InjectRepository(
      Encomienda,
      
    )
    private encomiendaRepository:
      Repository<Encomienda>,

    @InjectRepository(
      Persona,
    )
    private personaRepository:
      Repository<Persona>,

    @InjectRepository(
      Sede,
    )
    private sedeRepository:
      Repository<Sede>,

    @InjectRepository(
      User,
    )
    private userRepository:
      Repository<User>,

    private tarifasService:
      TarifasService,

    private historialService:
      HistorialEncomiendaService,

    private pagosService:
      PagosService,
  @InjectRepository(TrasladoEncomienda)
  private trasladoEncomiendaRepository: Repository<TrasladoEncomienda>,

  ) {}


  // =====================================================
  // CREAR ENCOMIENDA
  // =====================================================

  async create(
    encomienda:
      CreateEncomiendaDto,
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
      await this.userRepository
        .findOneBy({

          id:
            userId,

          active:
            true,

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
      this.encomiendaRepository
        .create({

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
      await this.encomiendaRepository
        .save(
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


  // =====================================================
  // LISTAR TODAS
  // =====================================================

  findAll() {

    return this.encomiendaRepository
      .find({

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



  async buscarParaAlmacen(
  sedeOrigenId:
    number | null,
  sedeDestinoId:
    number,
  filtro:
    string = 'pendientes',
) {

  if (
    sedeOrigenId === null ||
    sedeOrigenId === undefined
  ) {

    throw new BadRequestException(
      'El usuario de almacén no tiene una sede asignada',
    );
  }

  if (
    sedeOrigenId <= 0
  ) {

    throw new BadRequestException(
      'La sede del almacén no es válida',
    );
  }

  if (
    sedeDestinoId <= 0
  ) {

    throw new BadRequestException(
      'La sede destino no es válida',
    );
  }

  const filtroNormalizado =
    filtro
      .trim()
      .toLowerCase();

  if (
    filtroNormalizado !==
      'pendientes' &&
    filtroNormalizado !==
      'asignadas' &&
    filtroNormalizado !==
      'todas'
  ) {

    throw new BadRequestException(
      'El filtro debe ser pendientes, asignadas o todas',
    );
  }

  const sedeOrigen =
    await this.findSede(
      sedeOrigenId,
    );

  const sedeDestino =
    await this.findSede(
      sedeDestinoId,
    );

  if (
    sedeOrigen.id ===
    sedeDestino.id
  ) {

    throw new BadRequestException(
      'La sede destino debe ser diferente a la sede del almacén',
    );
  }

  const estadosTrasladoActivos = [
    TrasladoEstado.PROGRAMADO,
    TrasladoEstado.EN_CURSO,
  ];

  const query =
    this.encomiendaRepository
      .createQueryBuilder(
        'encomienda',
      )

      .leftJoinAndSelect(
        'encomienda.remitente',
        'remitente',
      )

      .leftJoinAndSelect(
        'encomienda.destinatario',
        'destinatario',
      )

      .leftJoinAndSelect(
        'encomienda.sede_origen',
        'sede_origen',
      )

      .leftJoinAndSelect(
        'encomienda.sede_destino',
        'sede_destino',
      )

      .leftJoinAndSelect(
        'encomienda.ultima_sede',
        'ultima_sede',
      )

      .leftJoinAndSelect(
        'encomienda.pago',
        'pago',
      )

      .leftJoinAndSelect(
        'encomienda.traslados',
        'detalle_traslado',
        'detalle_traslado.descargado_at IS NULL',
      )

      .leftJoinAndSelect(
        'detalle_traslado.traslado',
        'traslado',
        'traslado.estado IN (:...estadosTrasladoActivos)',
        {
          estadosTrasladoActivos:
            estadosTrasladoActivos,
        },
      )

      .leftJoinAndSelect(
        'traslado.vehiculo',
        'vehiculo',
      )

      .leftJoinAndSelect(
        'traslado.conductor',
        'conductor',
      )

      .leftJoinAndSelect(
        'traslado.ruta',
        'ruta',
      )

      .leftJoinAndSelect(
        'ruta.sedes',
        'ruta_sedes',
      )

      .leftJoinAndSelect(
        'ruta_sedes.sede',
        'ruta_sede',
      )

      .where(
        'sede_origen.id = :sedeOrigenId',
        {
          sedeOrigenId:
            sedeOrigen.id,
        },
      )

      .andWhere(
        'sede_destino.id = :sedeDestinoId',
        {
          sedeDestinoId:
            sedeDestino.id,
        },
      );

  if (
    filtroNormalizado ===
    'pendientes'
  ) {

    query.andWhere(
      `(
        encomienda.estado IN (:...estadosIngreso)
        OR
        (
          encomienda.estado = :estadoEnAlmacen
          AND traslado.id IS NULL
        )
      )`,
      {
        estadosIngreso: [
          EncomiendaEstado.REGISTRADO,
          EncomiendaEstado.CAMINO_ALMACEN,
        ],

        estadoEnAlmacen:
          EncomiendaEstado.EN_ALMACEN,
      },
    );
  }

  if (
    filtroNormalizado ===
    'asignadas'
  ) {

    query.andWhere(
      `(
        encomienda.estado = :estadoEnAlmacen
        AND traslado.id IS NOT NULL
      )`,
      {
        estadoEnAlmacen:
          EncomiendaEstado.EN_ALMACEN,
      },
    );
  }

  const encomiendas =
    await query
      .orderBy(
        'encomienda.id',
        'DESC',
      )
      .addOrderBy(
        'ruta_sedes.orden',
        'ASC',
      )
      .getMany();

  const encomiendasRespuesta =
    [];

  for (
    const encomienda of encomiendas
  ) {

    let trasladoAsignado:
      any = null;

    if (
      encomienda.traslados !==
        undefined &&
      encomienda.traslados !==
        null &&
      encomienda.traslados.length > 0
    ) {

      for (
        const detalle of
        encomienda.traslados
      ) {

        if (
          detalle.descargado_at !==
          null
        ) {

          continue;
        }

        if (
          detalle.traslado ===
            undefined ||
          detalle.traslado ===
            null
        ) {

          continue;
        }

        const traslado =
          detalle.traslado;

        if (
          traslado.estado !==
            TrasladoEstado.PROGRAMADO &&
          traslado.estado !==
            TrasladoEstado.EN_CURSO
        ) {

          continue;
        }

        if (
          traslado.vehiculo ===
            undefined ||
          traslado.vehiculo ===
            null
        ) {

          continue;
        }

        if (
          traslado.conductor ===
            undefined ||
          traslado.conductor ===
            null
        ) {

          continue;
        }

        if (
          traslado.ruta ===
            undefined ||
          traslado.ruta ===
            null
        ) {

          continue;
        }

        const recorrido:
          string[] = [];

        if (
          traslado.ruta.sedes !==
            undefined &&
          traslado.ruta.sedes !==
            null &&
          traslado.ruta.sedes.length > 0
        ) {

          const sedesOrdenadas =
            [
              ...traslado.ruta.sedes,
            ];

          sedesOrdenadas.sort(
            (
              sedeA,
              sedeB,
            ) => {

              return (
                sedeA.orden -
                sedeB.orden
              );
            },
          );

          for (
            const rutaSede of
            sedesOrdenadas
          ) {

            if (
              rutaSede.sede ===
                undefined ||
              rutaSede.sede ===
                null
            ) {

              continue;
            }

            recorrido.push(
              rutaSede.sede.name,
            );
          }
        }

        let descripcionVehiculo =
          '';

        if (
          traslado.vehiculo
            .descripcion !==
            undefined &&
          traslado.vehiculo
            .descripcion !==
            null
        ) {

          descripcionVehiculo =
            traslado.vehiculo
              .descripcion;
        }

        trasladoAsignado = {

          id:
            traslado.id,

          estado:
            traslado.estado,

          vehiculo: {

            id:
              traslado.vehiculo.id,

            placa:
              traslado.vehiculo.placa,

            descripcion:
              descripcionVehiculo,

          },

          conductor: {

            id:
              traslado.conductor.id,

            name:
              traslado.conductor.name,

          },

          ruta: {

            id:
              traslado.ruta.id,

            name:
              traslado.ruta.name,

            recorrido:
              recorrido,

          },

        };

        break;
      }
    }

    encomiendasRespuesta.push({

      id:
        encomienda.id,

      codigo_rastreo:
        encomienda.codigo_rastreo,

      estado:
        encomienda.estado,

      remitente:
        encomienda.remitente,

      destinatario:
        encomienda.destinatario,

      sede_origen:
        encomienda.sede_origen,

      sede_destino:
        encomienda.sede_destino,

      ultima_sede:
        encomienda.ultima_sede,

      alto_cm:
        encomienda.alto_cm,

      ancho_cm:
        encomienda.ancho_cm,

      largo_cm:
        encomienda.largo_cm,

      peso_kg:
        encomienda.peso_kg,

      costo_total:
        encomienda.costo_total,

      observacion:
        encomienda.observacion,

      pago:
        encomienda.pago,

      traslado_asignado:
        trasladoAsignado,

      created_at:
        encomienda.created_at,

      updated_at:
        encomienda.updated_at,

    });
  }

  return {

    filtro:
      filtroNormalizado,

    sede_origen: {

      id:
        sedeOrigen.id,

      name:
        sedeOrigen.name,

    },

    sede_destino: {

      id:
        sedeDestino.id,

      name:
        sedeDestino.name,

    },

    total:
      encomiendasRespuesta.length,

    encomiendas:
      encomiendasRespuesta,

  };
}


  // =====================================================
  // BUSCAR POR ID
  // =====================================================

  async findOne(
    id: number,
  ) {

    const encomiendaFound =
      await this.encomiendaRepository
        .findOne({

          where: {

            id:
              id,

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


  // =====================================================
  // ACTUALIZAR ENCOMIENDA
  // =====================================================

  async update(
    id: number,
    encomienda:
      UpdateEncomiendaDto,
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
      await this.encomiendaRepository
        .save(
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


  // =====================================================
  // INGRESAR AL ALMACEN POR CODIGO
  // =====================================================

  async ingresarAlmacenPorCodigo(
    codigoRastreo: string,
    sedeIdUsuario:
      number | null,
  ) {

    if (
      sedeIdUsuario === null ||
      sedeIdUsuario === undefined
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
      await this.encomiendaRepository
        .findOne({

          where: {

            codigo_rastreo:
              codigo,

          },

          relations: {

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


    // ===================================================
    // VALIDAR PAGO
    //
    // ORIGEN + PENDIENTE
    // -> NO puede ingresar
    //
    // ORIGEN + PAGADO
    // -> SI puede ingresar
    //
    // DESTINO + PENDIENTE
    // -> SI puede ingresar
    //
    // La lógica ya está dentro de validarPagoOrigen()
    // ===================================================

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
      await this.encomiendaRepository
        .save(
          encomienda,
        );


    await this.historialService
      .registrarCambio(

        encomiendaSaved,

        EncomiendaEstado
          .EN_ALMACEN,

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


  // =====================================================
  // ENTREGAR ENCOMIENDA
  // =====================================================

  async entregar(
  id: number,
  sedeIdUsuario: number | null,
) {

  if (
    sedeIdUsuario === null ||
    sedeIdUsuario === undefined
  ) {

    throw new BadRequestException(
      'El usuario de recepción no tiene una sede asignada',
    );

  }


  const encomienda =
    await this.encomiendaRepository.findOne({

      where: {
        id: id,
      },

      relations: {

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


  if (!encomienda) {

    throw new NotFoundException(
      'La encomienda no existe',
    );

  }


  if (
    encomienda.estado !==
    EncomiendaEstado.EN_SEDE_DESTINO
  ) {

    throw new BadRequestException(
      'La encomienda debe encontrarse en la sede destino antes de ser entregada',
    );

  }


  if (
    encomienda.sede_destino.id !==
    sedeIdUsuario
  ) {

    throw new BadRequestException(
      'La encomienda no pertenece a esta sede destino',
    );

  }


  if (!encomienda.ultima_sede) {

    throw new BadRequestException(
      'La encomienda no tiene una sede actual registrada',
    );

  }


  if (
    encomienda.ultima_sede.id !==
    sedeIdUsuario
  ) {

    throw new BadRequestException(
      'La encomienda todavía no se encuentra físicamente en esta sede',
    );

  }


  // Guardamos la sede antes de modificar la encomienda.
  // Así TypeScript sabe que NO es null.
  const sedeActual =
    encomienda.ultima_sede;


  // Debe estar pagada antes de entregar.
  // Si es DESTINO + PENDIENTE, aquí se bloquea.
  await this.pagosService
    .validarPagoRealizado(
      encomienda.id,
    );


  encomienda.estado =
    EncomiendaEstado.ENTREGADO;


  encomienda.entregado_at =
    new Date();


  const encomiendaSaved =
    await this.encomiendaRepository.save(
      encomienda,
    );


  await this.historialService
    .registrarCambio(

      encomiendaSaved,

      EncomiendaEstado.ENTREGADO,

      sedeActual,

    );


  return {

    message:
      'Encomienda entregada correctamente',

    encomienda: {

      id:
        encomiendaSaved.id,

      codigo_rastreo:
        encomiendaSaved.codigo_rastreo,

      estado:
        encomiendaSaved.estado,

      entregado_at:
        encomiendaSaved.entregado_at,

      sede_actual: {

        id:
          sedeActual.id,

        name:
          sedeActual.name,

      },

    },

  };

}

  private async findPersona(
    id: number,
  ) {

    const persona =
      await this.personaRepository
        .findOneBy({

          id:
            id,

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
      await this.sedeRepository
        .findOneBy({

          id:
            id,

          active:
            true,

        });


    if (!sede) {

      throw new NotFoundException(
        'La sede no existe o está inactiva',
      );

    }


    return sede;

  }


  // =====================================================
  // CALCULAR COSTO
  // =====================================================

  private calcularCosto(
    peso: number,
    precioBase: number,
    precioKgExcedente:
      number,
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


  // =====================================================
  // GENERAR CODIGO
  // =====================================================

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
  async rastrear(
  datos:
    RastrearEncomiendaDto,
) {

  const codigo =
    datos.codigoRastreo
      .trim()
      .toUpperCase();


  if (
    codigo.length ===
    0
  ) {

    throw new BadRequestException(
      'Debe ingresar el código de rastreo',
    );
  }


  const clave =
    datos.clave
      .trim();


  if (
    !/^[0-9]{4}$/
      .test(
        clave,
      )
  ) {

    throw new BadRequestException(
      'La clave debe contener exactamente 4 dígitos',
    );
  }


  const encomienda =
    await this.encomiendaRepository
      .findOne({

        where: {

          codigo_rastreo:
            codigo,

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


  if (
    !encomienda
  ) {

    throw new NotFoundException(
      'No existe una encomienda con ese código de rastreo',
    );
  }


  const claveCorrecta =
    await compare(
      clave,
      encomienda
        .clave_rastreo_hash,
    );


  if (
    !claveCorrecta
  ) {

    throw new BadRequestException(
      'La clave de rastreo es incorrecta',
    );
  }


  const historialResponse =
    await this.historialService
      .findByEncomienda(
        encomienda.id,
      );


  const asignaciones =
    await this
      .trasladoEncomiendaRepository
      .find({

        where: {

          encomienda: {

            id:
              encomienda.id,

          },

        },

        relations: {

          traslado: {

            vehiculo:
              true,

            conductor:
              true,

            ruta:
              true,

            ubicacion:
              true,

          },

        },

        order: {

          asignado_at:
            'DESC',

        },

      });


  let trasladoActivo:
    TrasladoEncomienda | null =
      null;


  for (
    const asignacion
    of asignaciones
  ) {

    if (
      asignacion.traslado.estado ===
      TrasladoEstado.EN_CURSO
    ) {

      trasladoActivo =
        asignacion;

      break;
    }
  }


  let trasladoActual:
    TrasladoEncomienda | null =
      trasladoActivo;


  if (
    trasladoActual ===
      null &&
    asignaciones.length >
      0
  ) {

    trasladoActual =
      asignaciones[0];
  }


  let sedeActualId =
    0;

  let sedeActualNombre =
    '';


  if (
    encomienda.ultima_sede
  ) {

    sedeActualId =
      encomienda
        .ultima_sede
        .id;

    sedeActualNombre =
      encomienda
        .ultima_sede
        .name;

  } else {

    sedeActualId =
      encomienda
        .sede_origen
        .id;

    sedeActualNombre =
      encomienda
        .sede_origen
        .name;
  }


  const estadosPrincipales = [

    EncomiendaEstado.REGISTRADO,

    EncomiendaEstado.EN_ALMACEN,

    EncomiendaEstado.EN_TRANSITO,

    EncomiendaEstado
      .EN_SEDE_DESTINO,

    EncomiendaEstado.ENTREGADO,

  ];


  let indiceActual =
    -1;


  for (
    let index = 0;
    index <
      estadosPrincipales.length;
    index = index + 1
  ) {

    if (
      estadosPrincipales[index] ===
      encomienda.estado
    ) {

      indiceActual =
        index;

      break;
    }
  }


  if (
    encomienda.estado ===
    EncomiendaEstado
      .CAMINO_ALMACEN
  ) {

    indiceActual =
      0;
  }


  const progreso =
    estadosPrincipales.map(
      (
        estado,
        index,
      ) => {

        let completado =
          false;

        let actual =
          false;


        if (
          encomienda.estado !==
          EncomiendaEstado.CANCELADO
        ) {

          if (
            index <=
            indiceActual
          ) {

            completado =
              true;
          }


          if (
            index ===
            indiceActual
          ) {

            actual =
              true;
          }
        }


        return {

          estado:
            estado,

          completado:
            completado,

          actual:
            actual,

        };

      },
    );


  let movilidadDisponible =
    false;

  let movilidadEnCurso =
    false;

  let vehiculo =
    '';

  let placa =
    '';

  let conductor =
    '';

  let ruta =
    '';

  let tieneUbicacion =
    false;

  let latitud =
    0;

  let longitud =
    0;

  let ubicacionActualizadaAt:
    Date | null =
      null;


  if (
    trasladoActual !==
    null
  ) {

    movilidadDisponible =
      true;


    const traslado =
      trasladoActual
        .traslado;


    if (
      traslado.estado ===
      TrasladoEstado.EN_CURSO
    ) {

      movilidadEnCurso =
        true;
    }


    if (
      traslado.vehiculo
    ) {

      vehiculo =
        traslado
          .vehiculo
          .descripcion;

      placa =
        traslado
          .vehiculo
          .placa;
    }


    if (
      traslado.conductor
    ) {

      conductor =
        traslado
          .conductor
          .name;
    }


    if (
      traslado.ruta
    ) {

      ruta =
        traslado
          .ruta
          .name;
    }


    if (
      traslado.ubicacion &&
      movilidadEnCurso &&
      encomienda.estado ===
        EncomiendaEstado
          .EN_TRANSITO
    ) {

      tieneUbicacion =
        true;

      latitud =
        Number(
          traslado
            .ubicacion
            .latitud,
        );

      longitud =
        Number(
          traslado
            .ubicacion
            .longitud,
        );

      ubicacionActualizadaAt =
        traslado
          .ubicacion
          .updated_at;
    }
  }


  let mensajeEstado =
    'Encomienda registrada';


  if (
    encomienda.estado ===
    EncomiendaEstado
      .CAMINO_ALMACEN
  ) {

    mensajeEstado =
      'La encomienda se dirige al almacén';

  } else if (
    encomienda.estado ===
    EncomiendaEstado
      .EN_ALMACEN
  ) {

    mensajeEstado =
      `La encomienda se encuentra en el almacén de ${sedeActualNombre}`;

  } else if (
    encomienda.estado ===
    EncomiendaEstado
      .EN_TRANSITO
  ) {

    mensajeEstado =
      `La encomienda se encuentra en tránsito hacia ${encomienda.sede_destino.name}`;

  } else if (
    encomienda.estado ===
    EncomiendaEstado
      .EN_SEDE_DESTINO
  ) {

    mensajeEstado =
      `La encomienda llegó a ${encomienda.sede_destino.name} y está disponible para entrega`;

  } else if (
    encomienda.estado ===
    EncomiendaEstado
      .ENTREGADO
  ) {

    mensajeEstado =
      'La encomienda fue entregada correctamente';

  } else if (
    encomienda.estado ===
    EncomiendaEstado
      .CANCELADO
  ) {

    mensajeEstado =
      'La encomienda fue cancelada';
  }


  return {

    encomienda: {

      id:
        encomienda.id,

      codigo_rastreo:
        encomienda.codigo_rastreo,

      estado:
        encomienda.estado,

      mensaje_estado:
        mensajeEstado,

      origen: {

        id:
          encomienda
            .sede_origen
            .id,

        name:
          encomienda
            .sede_origen
            .name,

      },

      destino: {

        id:
          encomienda
            .sede_destino
            .id,

        name:
          encomienda
            .sede_destino
            .name,

      },

      sede_actual: {

        id:
          sedeActualId,

        name:
          sedeActualNombre,

      },

      peso_kg:
        Number(
          encomienda.peso_kg,
        ),

      created_at:
        encomienda.created_at,

      updated_at:
        encomienda.updated_at,

      entregado_at:
        encomienda.entregado_at,

    },


    progreso:
      progreso,


    historial:
      historialResponse
        .historial,


    movilidad: {

      disponible:
        movilidadDisponible,

      en_curso:
        movilidadEnCurso,

      conductor:
        conductor,

      vehiculo:
        vehiculo,

      placa:
        placa,

      ruta:
        ruta,

      tiene_ubicacion:
        tieneUbicacion,

      latitud:
        latitud,

      longitud:
        longitud,

      updated_at:
        ubicacionActualizadaAt,

    },

  };
}

}