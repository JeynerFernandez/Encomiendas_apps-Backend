import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  EncomiendaEstado,
} from '../encomienda/encomienda-estado.enum.js';

import {
  Pago,
  PagoEstado,
} from '../pagos/pago.entity.js';

import {
  Traslado,
  TrasladoEstado,
} from '../traslados/traslado.entity.js';

import {
  User,
} from '../users/user.entity.js';

@Injectable()
export class ReportesService {

  constructor(

    @InjectRepository(Encomienda)
    private encomiendaRepository:
      Repository<Encomienda>,

    @InjectRepository(Pago)
    private pagoRepository:
      Repository<Pago>,

    @InjectRepository(Traslado)
    private trasladoRepository:
      Repository<Traslado>,

    @InjectRepository(User)
    private userRepository:
      Repository<User>,

  ) {}

  async obtenerEstadisticas() {

    const [
      totalEncomiendas,

      registradas,
      caminoAlmacen,
      enAlmacen,
      enTransito,
      enSedeDestino,
      entregadas,
      canceladas,

      totalPagos,
      pagosPagados,
      pagosPendientes,

      totalTraslados,
      trasladosProgramados,
      trasladosEnCurso,
      trasladosFinalizados,
      trasladosCancelados,

      totalUsuarios,
      usuariosActivos,
      usuariosInactivos,

    ] = await Promise.all([

      this.encomiendaRepository.count(),

      this.encomiendaRepository.countBy({
        estado:
          EncomiendaEstado.REGISTRADO,
      }),

      this.encomiendaRepository.countBy({
        estado:
          EncomiendaEstado.CAMINO_ALMACEN,
      }),

      this.encomiendaRepository.countBy({
        estado:
          EncomiendaEstado.EN_ALMACEN,
      }),

      this.encomiendaRepository.countBy({
        estado:
          EncomiendaEstado.EN_TRANSITO,
      }),

      this.encomiendaRepository.countBy({
        estado:
          EncomiendaEstado.EN_SEDE_DESTINO,
      }),

      this.encomiendaRepository.countBy({
        estado:
          EncomiendaEstado.ENTREGADO,
      }),

      this.encomiendaRepository.countBy({
        estado:
          EncomiendaEstado.CANCELADO,
      }),

      this.pagoRepository.count(),

      this.pagoRepository.countBy({
        estado:
          PagoEstado.PAGADO,
      }),

      this.pagoRepository.countBy({
        estado:
          PagoEstado.PENDIENTE,
      }),

      this.trasladoRepository.count(),

      this.trasladoRepository.countBy({
        estado:
          TrasladoEstado.PROGRAMADO,
      }),

      this.trasladoRepository.countBy({
        estado:
          TrasladoEstado.EN_CURSO,
      }),

      this.trasladoRepository.countBy({
        estado:
          TrasladoEstado.FINALIZADO,
      }),

      this.trasladoRepository.countBy({
        estado:
          TrasladoEstado.CANCELADO,
      }),

      this.userRepository.count(),

      this.userRepository.countBy({
        active: true,
      }),

      this.userRepository.countBy({
        active: false,
      }),

    ]);

    const totalIngresos =
      await this.obtenerTotalIngresos();

    const indicadores =
      this.calcularIndicadores(
        totalEncomiendas,
        entregadas,
        totalPagos,
        pagosPagados,
        totalTraslados,
        trasladosFinalizados,
        totalIngresos,
      );

    const validacion =
      this.validarResultados({

        totalEncomiendas,

        estadosEncomienda: [
          registradas,
          caminoAlmacen,
          enAlmacen,
          enTransito,
          enSedeDestino,
          entregadas,
          canceladas,
        ],

        totalPagos,

        estadosPago: [
          pagosPagados,
          pagosPendientes,
        ],

        totalTraslados,

        estadosTraslado: [
          trasladosProgramados,
          trasladosEnCurso,
          trasladosFinalizados,
          trasladosCancelados,
        ],

      });

    return {

      generado_en:
        new Date(),

      totales: {

        encomiendas:
          totalEncomiendas,

        pagos:
          totalPagos,

        ingresos:
          totalIngresos,

        traslados:
          totalTraslados,

        usuarios:
          totalUsuarios,

      },

      encomiendas: {

        total:
          totalEncomiendas,

        registradas:
          registradas,

        camino_almacen:
          caminoAlmacen,

        en_almacen:
          enAlmacen,

        en_transito:
          enTransito,

        en_sede_destino:
          enSedeDestino,

        entregadas:
          entregadas,

        canceladas:
          canceladas,

      },

      pagos: {

        total:
          totalPagos,

        pagados:
          pagosPagados,

        pendientes:
          pagosPendientes,

        ingresos:
          totalIngresos,

      },

      traslados: {

        total:
          totalTraslados,

        programados:
          trasladosProgramados,

        en_curso:
          trasladosEnCurso,

        finalizados:
          trasladosFinalizados,

        cancelados:
          trasladosCancelados,

      },

      usuarios: {

        total:
          totalUsuarios,

        activos:
          usuariosActivos,

        inactivos:
          usuariosInactivos,

      },

      indicadores:
        indicadores,

      validacion:
        validacion,

    };
  }

  private async obtenerTotalIngresos() {

    const resultado =
      await this.pagoRepository
        .createQueryBuilder(
          'pago',
        )
        .select(
          'COALESCE(SUM(pago.monto), 0)',
          'total',
        )
        .where(
          'pago.estado = :estado',
          {
            estado:
              PagoEstado.PAGADO,
          },
        )
        .getRawOne<{
          total: string;
        }>();

    return Number(
      resultado?.total ??
      0,
    );
  }

  private calcularIndicadores(
    totalEncomiendas: number,
    entregadas: number,
    totalPagos: number,
    pagosPagados: number,
    totalTraslados: number,
    trasladosFinalizados: number,
    totalIngresos: number,
  ) {

    const porcentajeEntregadas =
      this.calcularPorcentaje(
        entregadas,
        totalEncomiendas,
      );

    const porcentajePagosRealizados =
      this.calcularPorcentaje(
        pagosPagados,
        totalPagos,
      );

    const porcentajeTrasladosFinalizados =
      this.calcularPorcentaje(
        trasladosFinalizados,
        totalTraslados,
      );

    const ingresoPromedioPorPago =
      pagosPagados > 0
        ? Number(
            (
              totalIngresos /
              pagosPagados
            ).toFixed(2),
          )
        : 0;

    return {

      porcentaje_entregas:
        porcentajeEntregadas,

      porcentaje_pagos_realizados:
        porcentajePagosRealizados,

      porcentaje_traslados_finalizados:
        porcentajeTrasladosFinalizados,

      ingreso_promedio_por_pago:
        ingresoPromedioPorPago,

    };
  }

  private calcularPorcentaje(
    cantidad: number,
    total: number,
  ) {

    if (
      total === 0
    ) {

      return 0;

    }

    return Number(
      (
        (
          cantidad /
          total
        ) *
        100
      ).toFixed(2),
    );
  }

  private validarResultados(
    datos: {

      totalEncomiendas:
        number;

      estadosEncomienda:
        number[];

      totalPagos:
        number;

      estadosPago:
        number[];

      totalTraslados:
        number;

      estadosTraslado:
        number[];

    },
  ) {

    const sumaEncomiendas =
      datos.estadosEncomienda
        .reduce(
          (
            total,
            cantidad,
          ) =>
            total +
            cantidad,
          0,
        );

    const sumaPagos =
      datos.estadosPago
        .reduce(
          (
            total,
            cantidad,
          ) =>
            total +
            cantidad,
          0,
        );

    const sumaTraslados =
      datos.estadosTraslado
        .reduce(
          (
            total,
            cantidad,
          ) =>
            total +
            cantidad,
          0,
        );

    return {

      encomiendas:
        sumaEncomiendas ===
        datos.totalEncomiendas,

      pagos:
        sumaPagos ===
        datos.totalPagos,

      traslados:
        sumaTraslados ===
        datos.totalTraslados,

      resultados_consistentes:
        sumaEncomiendas ===
          datos.totalEncomiendas &&
        sumaPagos ===
          datos.totalPagos &&
        sumaTraslados ===
          datos.totalTraslados,

    };
  }

}