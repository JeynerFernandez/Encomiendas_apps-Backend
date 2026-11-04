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

    @InjectRepository(
      Entrega,
    )
    private entregaRepository:
      Repository<Entrega>,

    @InjectRepository(
      Encomienda,
    )
    private encomiendaRepository:
      Repository<Encomienda>,

    @InjectRepository(
      User,
    )
    private userRepository:
      Repository<User>,

    private pagosService:
      PagosService,

    private historialService:
      HistorialEncomiendaService,

  ) {}


  async findAll() {

    return this.entregaRepository
      .find({

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

            role:
              true,

          },

        },

        order: {

          id:
            'DESC',

        },

      });
  }


  async findPendientes(
    userId: number,
    sedeIdUsuario:
      number | null | undefined,
  ) {

    if (
      !Number.isInteger(
        userId,
      ) ||
      userId <= 0
    ) {

      throw new BadRequestException(
        'El usuario autenticado no es válido',
      );
    }


    if (
      sedeIdUsuario === null ||
      sedeIdUsuario === undefined
    ) {

      throw new ForbiddenException(
        'El usuario de recepción no tiene una sede asignada',
      );
    }


    if (
      !Number.isInteger(
        sedeIdUsuario,
      ) ||
      sedeIdUsuario <= 0
    ) {

      throw new BadRequestException(
        'La sede asignada al usuario no es válida',
      );
    }


    const usuario =
      await this.userRepository
        .findOne({

          where: {

            id:
              userId,

            active:
              true,

          },

          relations: {

            role:
              true,

          },

        });


    if (!usuario) {

      throw new NotFoundException(
        'El usuario de recepción no existe o está inactivo',
      );
    }


    if (
      !usuario.role ||
      usuario.role.name !==
      JwtRole.RECEPCION
    ) {

      throw new ForbiddenException(
        'El usuario no tiene permiso para consultar encomiendas pendientes de entrega',
      );
    }


    const encomiendas =
      await this.encomiendaRepository
        .find({

          where: {

            estado:
              EncomiendaEstado
                .EN_SEDE_DESTINO,

            sede_destino: {

              id:
                sedeIdUsuario,

            },

            ultima_sede: {

              id:
                sedeIdUsuario,

            },

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

          },

          order: {

            id:
              'DESC',

          },

        });


    const resultado =
  encomiendas.map(
    (encomienda) => {

      let observacion =
        '';


      if (
        encomienda.observacion !==
          null &&
        encomienda.observacion !==
          undefined
      ) {

        observacion =
          encomienda.observacion;
      }


      const ultimaSede =
        encomienda.ultima_sede;


      if (
        !ultimaSede
      ) {

        throw new BadRequestException(
          `La encomienda ${encomienda.codigo_rastreo} no tiene una sede física registrada`,
        );
      }


      return {

        id:
          encomienda.id,

        codigo_rastreo:
          encomienda
            .codigo_rastreo,

        estado:
          encomienda.estado,

        peso_kg:
          Number(
            encomienda
              .peso_kg,
          ),

        alto_cm:
          Number(
            encomienda
              .alto_cm,
          ),

        ancho_cm:
          Number(
            encomienda
              .ancho_cm,
          ),

        largo_cm:
          Number(
            encomienda
              .largo_cm,
          ),

        observacion:
          observacion,

        remitente: {

          dni:
            encomienda
              .remitente
              .dni,

          nombres:
            encomienda
              .remitente
              .nombres,

          apellido_paterno:
            encomienda
              .remitente
              .apellido_paterno,

          apellido_materno:
            encomienda
              .remitente
              .apellido_materno,

        },

        destinatario: {

          dni:
            encomienda
              .destinatario
              .dni,

          nombres:
            encomienda
              .destinatario
              .nombres,

          apellido_paterno:
            encomienda
              .destinatario
              .apellido_paterno,

          apellido_materno:
            encomienda
              .destinatario
              .apellido_materno,

        },

        sede_origen: {

          id:
            encomienda
              .sede_origen
              .id,

          name:
            encomienda
              .sede_origen
              .name,

        },

        sede_destino: {

          id:
            encomienda
              .sede_destino
              .id,

          name:
            encomienda
              .sede_destino
              .name,

        },

        ultima_sede: {

          id:
            ultimaSede.id,

          name:
            ultimaSede.name,

        },

      };

    },
  );;


    return {

      sede: {

        id:
          sedeIdUsuario,

      },

      total:
        resultado.length,

      encomiendas:
        resultado,

    };
  }


  async findOne(
    id: number,
  ) {

    if (
      !Number.isInteger(
        id,
      ) ||
      id <= 0
    ) {

      throw new BadRequestException(
        'El ID de la entrega no es válido',
      );
    }


    const entrega =
      await this.entregaRepository
        .findOne({

          where: {

            id:
              id,

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

              role:
                true,

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

    if (
      !Number.isInteger(
        encomiendaId,
      ) ||
      encomiendaId <= 0
    ) {

      throw new BadRequestException(
        'El ID de la encomienda no es válido',
      );
    }


    const entrega =
      await this.entregaRepository
        .findOne({

          where: {

            encomienda: {

              id:
                encomiendaId,

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

              role:
                true,

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
    sedeIdUsuario:
      number | null | undefined,
  ) {

    if (
      !Number.isInteger(
        encomiendaId,
      ) ||
      encomiendaId <= 0
    ) {

      throw new BadRequestException(
        'El ID de la encomienda no es válido',
      );
    }


    if (
      !Number.isInteger(
        userId,
      ) ||
      userId <= 0
    ) {

      throw new BadRequestException(
        'El usuario autenticado no es válido',
      );
    }


    if (
      sedeIdUsuario === null ||
      sedeIdUsuario === undefined
    ) {

      throw new ForbiddenException(
        'El usuario de recepción no tiene una sede asignada',
      );
    }


    if (
      !Number.isInteger(
        sedeIdUsuario,
      ) ||
      sedeIdUsuario <= 0
    ) {

      throw new BadRequestException(
        'La sede del usuario no es válida',
      );
    }


    const usuario =
      await this.userRepository
        .findOne({

          where: {

            id:
              userId,

            active:
              true,

          },

          relations: {

            role:
              true,

          },

        });


    if (!usuario) {

      throw new NotFoundException(
        'El usuario que realiza la entrega no existe o está inactivo',
      );
    }


    if (
      !usuario.role ||
      usuario.role.name !==
      JwtRole.RECEPCION
    ) {

      throw new ForbiddenException(
        'El usuario no tiene permiso para realizar entregas',
      );
    }


    const encomienda =
      await this.encomiendaRepository
        .findOne({

          where: {

            id:
              encomiendaId,

          },

          relations: {

            destinatario:
              true,

            remitente:
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
      EncomiendaEstado
        .EN_SEDE_DESTINO
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
      !encomienda.ultima_sede
    ) {

      throw new BadRequestException(
        'La encomienda todavía no tiene una sede física registrada',
      );
    }


    if (
      encomienda.ultima_sede.id !==
      sedeIdUsuario
    ) {

      throw new BadRequestException(
        'La encomienda no se encuentra físicamente en esta sede',
      );
    }


    if (
      encomienda.ultima_sede.id !==
      encomienda.sede_destino.id
    ) {

      throw new BadRequestException(
        'La encomienda todavía no ha llegado a su sede destino',
      );
    }


    const entregaExistente =
      await this.entregaRepository
        .findOne({

          where: {

            encomienda: {

              id:
                encomienda.id,

            },

          },

        });


    if (
      entregaExistente
    ) {

      throw new ConflictException(
        'La encomienda ya tiene una entrega registrada',
      );
    }


    if (
      !entrega.dni ||
      entrega.dni.trim()
        .length ===
      0
    ) {

      throw new BadRequestException(
        'Debe ingresar el DNI del destinatario',
      );
    }


    if (
      !/^[0-9]{8}$/
        .test(
          entrega.dni.trim(),
        )
    ) {

      throw new BadRequestException(
        'El DNI debe contener exactamente 8 dígitos',
      );
    }


    if (
      entrega.dni.trim() !==
      encomienda
        .destinatario
        .dni
        .trim()
    ) {

      throw new BadRequestException(
        'El DNI ingresado no corresponde al destinatario de la encomienda',
      );
    }


    if (
      !entrega.clave ||
      entrega.clave.trim()
        .length ===
      0
    ) {

      throw new BadRequestException(
        'Debe ingresar la clave de entrega',
      );
    }


    await this.pagosService
      .validarPagoRealizado(
        encomienda.id,
      );


    const claveCorrecta =
      await compare(
        entrega.clave.trim(),
        encomienda
          .clave_rastreo_hash,
      );


    if (
      !claveCorrecta
    ) {

      throw new BadRequestException(
        'La clave de entrega es incorrecta',
      );
    }


    const fechaEntrega =
      new Date();


    const newEntrega =
      this.entregaRepository
        .create({

          encomienda:
            encomienda,

          usuario_entrega:
            usuario,

          dni_receptor:
            entrega.dni.trim(),

          entregado_at:
            fechaEntrega,

        });


    const entregaSaved =
      await this.entregaRepository
        .save(
          newEntrega,
        );


    encomienda.estado =
      EncomiendaEstado
        .ENTREGADO;

    encomienda.entregado_at =
      fechaEntrega;

    encomienda.ultima_sede =
      encomienda.sede_destino;


    const encomiendaSaved =
      await this.encomiendaRepository
        .save(
          encomienda,
        );


    await this.historialService
      .registrarCambio(

        encomiendaSaved,

        EncomiendaEstado
          .ENTREGADO,

        encomiendaSaved
          .sede_destino,

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
          encomiendaSaved
            .codigo_rastreo,

        estado:
          encomiendaSaved.estado,

        dni_receptor:
          entregaSaved
            .dni_receptor,

        destinatario: {

          nombres:
            encomiendaSaved
              .destinatario
              .nombres,

          apellido_paterno:
            encomiendaSaved
              .destinatario
              .apellido_paterno,

          apellido_materno:
            encomiendaSaved
              .destinatario
              .apellido_materno,

        },

        sede: {

          id:
            encomiendaSaved
              .sede_destino
              .id,

          name:
            encomiendaSaved
              .sede_destino
              .name,

        },

        entregado_at:
          entregaSaved
            .entregado_at,

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