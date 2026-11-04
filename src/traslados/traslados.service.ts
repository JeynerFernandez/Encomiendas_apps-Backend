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

    @InjectRepository(
      Traslado,
    )
    private trasladoRepository:
      Repository<Traslado>,

    @InjectRepository(
      Ruta,
    )
    private rutaRepository:
      Repository<Ruta>,

    @InjectRepository(
      Vehiculo,
    )
    private vehiculoRepository:
      Repository<Vehiculo>,

    @InjectRepository(
      User,
    )
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


  // =====================================================
  // CREAR TRASLADO
  // =====================================================

  async create(
    traslado:
      CreateTrasladoDto,
  ) {

    const ruta =
      await this.rutaRepository
        .findOneBy({

          id:
            traslado.rutaId,

          active:
            true,

        });


    if (!ruta) {

      throw new NotFoundException(
        'La ruta no existe o está inactiva',
      );
    }


    const vehiculo =
      await this.vehiculoRepository
        .findOneBy({

          id:
            traslado.vehiculoId,

          active:
            true,

        });


    if (!vehiculo) {

      throw new NotFoundException(
        'El vehículo no existe o está inactivo',
      );
    }


    const conductor =
      await this.userRepository
        .findOne({

          where: {

            id:
              traslado.conductorId,

            active:
              true,

          },

          relations: {

            role:
              true,

          },

        });


    if (!conductor) {

      throw new NotFoundException(
        'El conductor no existe o está inactivo',
      );
    }


    if (
      !conductor.role ||
      conductor.role.name !==
      JwtRole.MOVILIDAD
    ) {

      throw new BadRequestException(
        'El usuario seleccionado no tiene el rol MOVILIDAD',
      );
    }


    await this
      .validateVehiculoDisponible(
        vehiculo.id,
        null,
      );


    await this
      .validateConductorDisponible(
        conductor.id,
        null,
      );


    const newTraslado =
      this.trasladoRepository
        .create({

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


    return this.trasladoRepository
      .save(
        newTraslado,
      );
  }


  // =====================================================
  // LISTAR TODOS LOS TRASLADOS
  // =====================================================

  findAll() {

    return this.trasladoRepository
      .find({

        relations: {

          ruta:
            true,

          vehiculo:
            true,

          conductor: {

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


  // =====================================================
  // MOVILIDAD
  // LISTAR MIS TRASLADOS
  // =====================================================

  async findMisTraslados(
    userId: number,
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


    const conductor =
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


    if (!conductor) {

      throw new NotFoundException(
        'El conductor no existe o está inactivo',
      );
    }


    if (
      !conductor.role ||
      conductor.role.name !==
      JwtRole.MOVILIDAD
    ) {

      throw new ForbiddenException(
        'El usuario autenticado no tiene el rol MOVILIDAD',
      );
    }


    const traslados =
      await this.trasladoRepository
        .find({

          where: {

            conductor: {

              id:
                userId,

            },

          },

          relations: {

            ruta: {

              sedes: {

                sede:
                  true,

              },

            },

            vehiculo:
              true,

            conductor: {

              role:
                true,

            },

            encomiendas: {

              encomienda: {

                destinatario:
                  true,

                sede_destino:
                  true,

                ultima_sede:
                  true,

              },

            },

          },

          order: {

            id:
              'DESC',

          },

        });


    const resultado =
      traslados.map(
        (traslado) => {

          const sedesRuta =
            Array.isArray(
              traslado.ruta.sedes,
            )
              ? traslado.ruta.sedes
              : [];


          const recorrido =
            [
              ...sedesRuta,
            ]
              .sort(
                (
                  a,
                  b,
                ) =>

                  a.orden -
                  b.orden,
              )
              .map(
                (item) => ({

                  orden:
                    item.orden,

                  sede: {

                    id:
                      item.sede.id,

                    name:
                      item.sede.name,

                  },

                }),
              );


          const detalles =
            Array.isArray(
              traslado.encomiendas,
            )
              ? traslado.encomiendas
              : [];


          const encomiendas =
            detalles.map(
              (detalle) => {

                const encomienda =
                  detalle.encomienda;


                const destinatario =
                  encomienda.destinatario;


                const sedeDestino =
                  encomienda.sede_destino;


                const ultimaSede =
                  encomienda.ultima_sede;


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


                let ultimaSedeId =
                  0;

                let ultimaSedeNombre =
                  '';


                if (
                  ultimaSede
                ) {

                  ultimaSedeId =
                    ultimaSede.id;

                  ultimaSedeNombre =
                    ultimaSede.name;
                }


                return {

                  detalleId:
                    detalle.id,

                  descargado_at:
                    detalle.descargado_at,

                  encomienda: {

                    id:
                      encomienda.id,

                    codigo_rastreo:
                      encomienda
                        .codigo_rastreo,

                    observacion:
                      observacion,

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

                    peso_kg:
                      Number(
                        encomienda
                          .peso_kg,
                      ),

                    estado:
                      encomienda.estado,

                    destinatario: {

                      dni:
                        destinatario.dni,

                      nombres:
                        destinatario
                          .nombres,

                      apellido_paterno:
                        destinatario
                          .apellido_paterno,

                      apellido_materno:
                        destinatario
                          .apellido_materno,

                    },

                    sede_destino: {

                      id:
                        sedeDestino.id,

                      name:
                        sedeDestino.name,

                    },

                    ultima_sede: {

                      id:
                        ultimaSedeId,

                      name:
                        ultimaSedeNombre,

                    },

                  },

                };

              },
            );


          const pendientesDescarga =
            detalles.filter(
              (detalle) =>

                detalle.descargado_at ===
                null,
            ).length;


          const descargadas =
            detalles.length -
            pendientesDescarga;


          return {

            id:
              traslado.id,

            estado:
              traslado.estado,

            salida_at:
              traslado.salida_at,

            llegada_at:
              traslado.llegada_at,

            created_at:
              traslado.created_at,

            updated_at:
              traslado.updated_at,

            ruta: {

              id:
                traslado.ruta.id,

              name:
                traslado.ruta.name,

              recorrido:
                recorrido,

            },

            vehiculo: {

              id:
                traslado.vehiculo.id,

              placa:
                traslado
                  .vehiculo
                  .placa,

              descripcion:
                traslado
                  .vehiculo
                  .descripcion,

              capacidad_kg:
                Number(
                  traslado
                    .vehiculo
                    .capacidad_kg,
                ),

            },

            conductor: {

              id:
                conductor.id,

              name:
                conductor.name,

            },

            resumen: {

              total_encomiendas:
                encomiendas.length,

              pendientes_descarga:
                pendientesDescarga,

              descargadas:
                descargadas,

            },

            encomiendas:
              encomiendas,

          };

        },
      );


    const programados =
      resultado.filter(
        (traslado) =>

          traslado.estado ===
          TrasladoEstado.PROGRAMADO,
      ).length;


    const enCurso =
      resultado.filter(
        (traslado) =>

          traslado.estado ===
          TrasladoEstado.EN_CURSO,
      ).length;


    const finalizados =
      resultado.filter(
        (traslado) =>

          traslado.estado ===
          TrasladoEstado.FINALIZADO,
      ).length;


    const cancelados =
      resultado.filter(
        (traslado) =>

          traslado.estado ===
          TrasladoEstado.CANCELADO,
      ).length;


    return {

      conductor: {

        id:
          conductor.id,

        name:
          conductor.name,

      },

      resumen: {

        total:
          resultado.length,

        programados:
          programados,

        en_curso:
          enCurso,

        finalizados:
          finalizados,

        cancelados:
          cancelados,

      },

      traslados:
        resultado,

    };
  }


  // =====================================================
  // TRASLADOS DISPONIBLES PARA ALMACÉN
  // =====================================================

  async findDisponiblesParaAlmacen(
    sedeOrigenId:
      number | null,

    sedeDestinoId:
      number,
  ) {

    if (
      sedeOrigenId ===
        null ||
      sedeOrigenId ===
        undefined
    ) {

      throw new BadRequestException(
        'El usuario de almacén no tiene una sede asignada',
      );
    }


    if (
      !Number.isInteger(
        sedeOrigenId,
      ) ||
      sedeOrigenId <= 0
    ) {

      throw new BadRequestException(
        'La sede de origen no es válida',
      );
    }


    if (
      !Number.isInteger(
        sedeDestinoId,
      ) ||
      sedeDestinoId <= 0
    ) {

      throw new BadRequestException(
        'La sede destino no es válida',
      );
    }


    if (
      sedeOrigenId ===
      sedeDestinoId
    ) {

      throw new BadRequestException(
        'La sede destino debe ser diferente a la sede actual',
      );
    }


    const traslados =
      await this.trasladoRepository
        .find({

          where: {

            estado:
              TrasladoEstado
                .PROGRAMADO,

          },

          relations: {

            ruta: {

              sedes: {

                sede:
                  true,

              },

            },

            vehiculo:
              true,

            conductor:
              true,

            encomiendas: {

              encomienda:
                true,

            },

          },

          order: {

            id:
              'DESC',

          },

        });


    const disponibles =
      traslados
        .filter(
          (traslado) => {

            if (
              !traslado.vehiculo ||
              !traslado
                .vehiculo
                .active
            ) {

              return false;
            }


            const sedesRuta =
              Array.isArray(
                traslado.ruta.sedes,
              )
                ? traslado.ruta.sedes
                : [];


            const sedeOrigenEnRuta =
              sedesRuta.find(
                (item) =>

                  item.sede.id ===
                  sedeOrigenId,
              );


            const sedeDestinoEnRuta =
              sedesRuta.find(
                (item) =>

                  item.sede.id ===
                  sedeDestinoId,
              );


            if (
              !sedeOrigenEnRuta ||
              !sedeDestinoEnRuta
            ) {

              return false;
            }


            return (
              sedeDestinoEnRuta
                .orden >
              sedeOrigenEnRuta
                .orden
            );

          },
        )
        .map(
          (traslado) => {

            const detalles =
              Array.isArray(
                traslado.encomiendas,
              )
                ? traslado.encomiendas
                : [];


            const encomiendasActivas =
              detalles.filter(
                (detalle) =>

                  detalle.descargado_at ===
                  null,
              );


            const cargaActualKg =
              encomiendasActivas
                .reduce(

                  (
                    total,
                    detalle,
                  ) => {

                    return (
                      total +
                      Number(
                        detalle
                          .encomienda
                          .peso_kg,
                      )
                    );

                  },

                  0,

                );


            const capacidadKg =
              Number(
                traslado
                  .vehiculo
                  .capacidad_kg,
              );


            const capacidadDisponibleKg =
              Math.max(
                capacidadKg -
                cargaActualKg,
                0,
              );


            const sedesRuta =
              Array.isArray(
                traslado.ruta.sedes,
              )
                ? traslado.ruta.sedes
                : [];


            const recorrido =
              [
                ...sedesRuta,
              ]
                .sort(
                  (
                    a,
                    b,
                  ) =>

                    a.orden -
                    b.orden,
                )
                .map(
                  (item) =>

                    item.sede.name,
                );


            return {

              trasladoId:
                traslado.id,

              estado:
                traslado.estado,

              vehiculo: {

                id:
                  traslado.vehiculo.id,

                placa:
                  traslado
                    .vehiculo
                    .placa,

                descripcion:
                  traslado
                    .vehiculo
                    .descripcion,

                capacidad_kg:
                  capacidadKg,

                carga_actual_kg:
                  cargaActualKg,

                capacidad_disponible_kg:
                  capacidadDisponibleKg,

              },

              conductor: {

                id:
                  traslado
                    .conductor
                    .id,

                name:
                  traslado
                    .conductor
                    .name,

              },

              recorrido:
                recorrido,

            };

          },
        );


    return {

      sede_origen_id:
        sedeOrigenId,

      sede_destino_id:
        sedeDestinoId,

      total:
        disponibles.length,

      traslados:
        disponibles,

    };
  }


  // =====================================================
  // BUSCAR TRASLADO POR ID
  // =====================================================

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
        'El ID del traslado no es válido',
      );
    }


    const trasladoFound =
      await this.trasladoRepository
        .findOne({

          where: {

            id:
              id,

          },

          relations: {

            ruta:
              true,

            vehiculo:
              true,

            conductor: {

              role:
                true,

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


  // =====================================================
  // ACTUALIZAR TRASLADO
  // =====================================================

  async update(
    id: number,

    traslado:
      UpdateTrasladoDto,
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
        await this.rutaRepository
          .findOneBy({

            id:
              traslado.rutaId,

            active:
              true,

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
        await this.vehiculoRepository
          .findOneBy({

            id:
              traslado.vehiculoId,

            active:
              true,

          });


      if (!vehiculo) {

        throw new NotFoundException(
          'El vehículo no existe o está inactivo',
        );
      }


      await this
        .validateVehiculoDisponible(
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
        await this.userRepository
          .findOne({

            where: {

              id:
                traslado
                  .conductorId,

              active:
                true,

            },

            relations: {

              role:
                true,

            },

          });


      if (!conductor) {

        throw new NotFoundException(
          'El conductor no existe o está inactivo',
        );
      }


      if (
        !conductor.role ||
        conductor.role.name !==
        JwtRole.MOVILIDAD
      ) {

        throw new BadRequestException(
          'El usuario seleccionado no tiene el rol MOVILIDAD',
        );
      }


      await this
        .validateConductorDisponible(
          conductor.id,
          id,
        );


      trasladoFound.conductor =
        conductor;
    }


    return this.trasladoRepository
      .save(
        trasladoFound,
      );
  }


  // =====================================================
  // MOVILIDAD
  // INICIAR TRASLADO
  // =====================================================

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

              id:
                traslado.id,

            },

            descargado_at:
              IsNull(),

          },

          relations: {

            encomienda: {

              ultima_sede:
                true,

              sede_destino:
                true,

            },

          },

        });


    if (
      detalles.length ===
      0
    ) {

      throw new BadRequestException(
        'El traslado no tiene encomiendas asignadas',
      );
    }


    for (
      const detalle
      of detalles
    ) {

      if (
        detalle
          .encomienda
          .estado !==
        EncomiendaEstado
          .EN_ALMACEN
      ) {

        throw new BadRequestException(
          `La encomienda ${detalle.encomienda.codigo_rastreo} no se encuentra en almacén`,
        );
      }

    }


    traslado.estado =
      TrasladoEstado
        .EN_CURSO;

    traslado.salida_at =
      new Date();

    traslado.llegada_at =
      null;


    await this
      .trasladoRepository
      .save(
        traslado,
      );


    for (
      const detalle
      of detalles
    ) {

      detalle.encomienda.estado =
        EncomiendaEstado
          .EN_TRANSITO;

    }


    const encomiendas =
      detalles.map(
        (detalle) =>

          detalle.encomienda,
      );


    await this
      .encomiendaRepository
      .save(
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

              encomienda
                .ultima_sede,

            ),

      ),

    );


    return this.findOne(
      id,
    );
  }


  // =====================================================
  // MOVILIDAD
  // FINALIZAR TRASLADO
  // =====================================================

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

              id:
                traslado.id,

            },

            descargado_at:
              IsNull(),

          },

        });


    if (
      encomiendasPendientes >
      0
    ) {

      throw new BadRequestException(
        'No se puede finalizar el traslado porque todavía existen encomiendas pendientes de descargar',
      );
    }


    traslado.estado =
      TrasladoEstado
        .FINALIZADO;

    traslado.llegada_at =
      new Date();


    return this
      .trasladoRepository
      .save(
        traslado,
      );
  }


  // =====================================================
  // CANCELAR TRASLADO
  // =====================================================

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

              id:
                traslado.id,

            },

          },

        });


    if (
      detalles.length >
      0
    ) {

      await this
        .trasladoEncomiendaRepository
        .remove(
          detalles,
        );
    }


    traslado.estado =
      TrasladoEstado
        .CANCELADO;


    return this
      .trasladoRepository
      .save(
        traslado,
      );
  }


  // =====================================================
  // VALIDAR VEHÍCULO DISPONIBLE
  // =====================================================

  private async validateVehiculoDisponible(
    vehiculoId: number,

    trasladoId:
      number | null,
  ) {

    const trasladoExist =
      await this
        .trasladoRepository
        .findOne({

          where: {

            vehiculo: {

              id:
                vehiculoId,

            },

            estado:
              In([

                TrasladoEstado
                  .PROGRAMADO,

                TrasladoEstado
                  .EN_CURSO,

              ]),

          },

        });


    if (
      trasladoExist &&
      (
        trasladoId ===
          null ||
        trasladoExist.id !==
          trasladoId
      )
    ) {

      throw new ConflictException(
        'El vehículo ya está asignado a otro traslado activo',
      );
    }
  }


  // =====================================================
  // VALIDAR CONDUCTOR DISPONIBLE
  // =====================================================

  private async validateConductorDisponible(
    conductorId: number,

    trasladoId:
      number | null,
  ) {

    const trasladoExist =
      await this
        .trasladoRepository
        .findOne({

          where: {

            conductor: {

              id:
                conductorId,

            },

            estado:
              In([

                TrasladoEstado
                  .PROGRAMADO,

                TrasladoEstado
                  .EN_CURSO,

              ]),

          },

        });


    if (
      trasladoExist &&
      (
        trasladoId ===
          null ||
        trasladoExist.id !==
          trasladoId
      )
    ) {

      throw new ConflictException(
        'El conductor ya está asignado a otro traslado activo',
      );
    }
  }
  async retornarASedeCentral(
  id: number,
  userId: number,
) {

  const traslado =
    await this.trasladoRepository.findOne({

      where: {
        id: id,
      },

      relations: {

        ruta: {

          sedes: {
            sede: true,
          },

        },

        vehiculo:
          true,

        conductor: {
          role: true,
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
    userId
  ) {

    throw new ForbiddenException(
      'Este traslado no está asignado a este conductor',
    );
  }


  if (
    traslado.estado !==
    TrasladoEstado.FINALIZADO
  ) {

    throw new BadRequestException(
      'Solo se puede retornar a sede central después de finalizar el traslado',
    );
  }


  if (
    !traslado.ruta.active
  ) {

    throw new BadRequestException(
      'La ruta del traslado se encuentra inactiva',
    );
  }


  if (
    !traslado.vehiculo.active
  ) {

    throw new BadRequestException(
      'El vehículo se encuentra inactivo',
    );
  }


  if (
    !traslado.conductor.active
  ) {

    throw new BadRequestException(
      'El conductor se encuentra inactivo',
    );
  }


  if (
    traslado.ruta.sedes.length ===
    0
  ) {

    throw new BadRequestException(
      'La ruta no tiene sedes configuradas',
    );
  }


  const recorrido =
    [
      ...traslado.ruta.sedes,
    ];


  recorrido.sort(
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


  const sedeCentral =
    recorrido[0].sede;


  const trasladoActivoVehiculo =
    await this.trasladoRepository.findOne({

      where: {

        vehiculo: {
          id: traslado.vehiculo.id,
        },

        estado:
          In([
            TrasladoEstado.PROGRAMADO,
            TrasladoEstado.EN_CURSO,
          ]),

      },

    });


  if (
    trasladoActivoVehiculo
  ) {

    throw new ConflictException(
      'El vehículo ya tiene un traslado activo',
    );
  }


  const trasladoActivoConductor =
    await this.trasladoRepository.findOne({

      where: {

        conductor: {
          id: traslado.conductor.id,
        },

        estado:
          In([
            TrasladoEstado.PROGRAMADO,
            TrasladoEstado.EN_CURSO,
          ]),

      },

    });


  if (
    trasladoActivoConductor
  ) {

    throw new ConflictException(
      'El conductor ya tiene un traslado activo',
    );
  }


  const nuevoTraslado =
    this.trasladoRepository.create({

      ruta:
        traslado.ruta,

      vehiculo:
        traslado.vehiculo,

      conductor:
        traslado.conductor,

      estado:
        TrasladoEstado.PROGRAMADO,

      salida_at:
        null,

      llegada_at:
        null,

    });


  const trasladoGuardado =
    await this.trasladoRepository.save(
      nuevoTraslado,
    );


  return {

    mensaje:
      'Retorno a sede central registrado correctamente',

    sede_central: {

      id:
        sedeCentral.id,

      name:
        sedeCentral.name,

    },

    traslado_finalizado_id:
      traslado.id,

    nuevo_traslado_id:
      trasladoGuardado.id,

    estado:
      trasladoGuardado.estado,

    vehiculo: {

      id:
        traslado.vehiculo.id,

      placa:
        traslado.vehiculo.placa,

    },

    conductor: {

      id:
        traslado.conductor.id,

      name:
        traslado.conductor.name,

    },

  };
}

}