import {
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
  HistorialEncomienda,
} from './historial-encomienda.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  EncomiendaEstado,
} from '../encomienda/encomienda-estado.enum.js';
import {
  Sede,
} from '../sedes/sede.entity.js';

@Injectable()
export class HistorialEncomiendaService {

  constructor(

    @InjectRepository(
      HistorialEncomienda,
    )
    private historialRepository:
      Repository<HistorialEncomienda>,

    @InjectRepository(
      Encomienda,
    )
    private encomiendaRepository:
      Repository<Encomienda>,

  ) {}

  async registrarCambio(
    encomienda: Encomienda,
    estado: EncomiendaEstado,
    sede: Sede | null,
  ) {

    const historial =
      this.historialRepository.create({
        encomienda:
          encomienda,

        estado:
          estado,

        sede:
          sede,
      });

    return this.historialRepository.save(
      historial,
    );
  }

  async findByEncomienda(
    encomiendaId: number,
  ) {

    const encomienda =
      await this.encomiendaRepository.findOne({
        where: {
          id: encomiendaId,
        },
        relations: {
          sede_origen: true,
          sede_destino: true,
          ultima_sede: true,
        },
      });

    if (!encomienda) {
      throw new NotFoundException(
        'La encomienda no existe',
      );
    }

    const historial =
      await this.historialRepository.find({
        where: {
          encomienda: {
            id: encomiendaId,
          },
        },
        relations: {
          sede: true,
        },
        order: {
          created_at: 'ASC',
        },
      });

    return {
      encomienda: {
        id:
          encomienda.id,

        codigo_rastreo:
          encomienda.codigo_rastreo,

        estado_actual:
          encomienda.estado,

        origen:
          encomienda.sede_origen.name,

        destino:
          encomienda.sede_destino.name,

        ultima_sede:
          encomienda.ultima_sede
            ? encomienda.ultima_sede.name
            : null,
      },

      historial:
        historial.map(
          (item) => ({
            id:
              item.id,

            estado:
              item.estado,

            sede:
              item.sede
                ? {
                    id:
                      item.sede.id,

                    name:
                      item.sede.name,
                  }
                : null,

            mensaje:
              this.getMensaje(
                item.estado,
                item.sede,
                encomienda,
              ),

            fecha:
              item.created_at,
          }),
        ),
    };
  }

  private getMensaje(
    estado: EncomiendaEstado,
    sede: Sede | null,
    encomienda: Encomienda,
  ) {

    const sedeNombre =
      sede?.name ?? '';

    switch (estado) {

      case EncomiendaEstado.REGISTRADO:

        return sede
          ? `Encomienda registrada en ${sedeNombre}`
          : 'Encomienda registrada';

      case EncomiendaEstado.CAMINO_ALMACEN:

        return sede
          ? `En camino al almacén de ${sedeNombre}`
          : 'En camino al almacén';

      case EncomiendaEstado.EN_ALMACEN:

        return sede
          ? `En almacén - ${sedeNombre}`
          : 'En almacén';

      case EncomiendaEstado.EN_TRANSITO:

        return sede
          ? `En tránsito desde ${sedeNombre} hacia ${encomienda.sede_destino.name}`
          : `En tránsito hacia ${encomienda.sede_destino.name}`;

      case EncomiendaEstado.EN_SEDE_DESTINO:

        return sede
          ? `Llegó a ${sedeNombre}`
          : 'Llegó a la sede destino';

      case EncomiendaEstado.ENTREGADO:

        return sede
          ? `Encomienda entregada en ${sedeNombre}`
          : 'Encomienda entregada';

      case EncomiendaEstado.CANCELADO:

        return sede
          ? `Encomienda cancelada en ${sedeNombre}`
          : 'Encomienda cancelada';

      default:

        return estado;
    }
  }

}