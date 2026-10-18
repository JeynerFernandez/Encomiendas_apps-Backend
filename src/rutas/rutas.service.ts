import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InjectRepository,
} from '@nestjs/typeorm';
import {
  In,
  Repository,
} from 'typeorm';
import { Ruta } from './ruta.entity.js';
import { RutaSede } from './ruta-sede.entity.js';
import { Sede } from '../sedes/sede.entity.js';
import {
  CreateRutaDto,
  RutaSedeDto,
} from './dto/create-ruta.dto.js';
import { UpdateRutaDto } from './dto/update-ruta.dto.js';

@Injectable()
export class RutasService {

  constructor(

    @InjectRepository(Ruta)
    private rutaRepository:
      Repository<Ruta>,

    @InjectRepository(RutaSede)
    private rutaSedeRepository:
      Repository<RutaSede>,

    @InjectRepository(Sede)
    private sedeRepository:
      Repository<Sede>,

  ) {}

  async create(
    ruta: CreateRutaDto,
  ) {

    const rutaExist =
      await this.rutaRepository.findOneBy({
        name: ruta.name,
      });

    if (rutaExist) {

      throw new ConflictException(
        'La ruta ya está registrada',
      );

    }

    const sedes =
      await this.validateSedes(
        ruta.sedes,
      );

    const newRuta =
      this.rutaRepository.create({
        name: ruta.name,
        active: true,
      });

    const rutaSaved =
      await this.rutaRepository.save(
        newRuta,
      );

    const detalles =
      ruta.sedes.map(
        (detalle) => {

          const sede =
            sedes.find(
              (item) =>
                item.id ===
                detalle.sedeId,
            );

          return this
            .rutaSedeRepository
            .create({
              ruta: rutaSaved,
              sede: sede!,
              orden:
                detalle.orden,
            });

        },
      );

    await this.rutaSedeRepository.save(
      detalles,
    );

    return this.findOne(
      rutaSaved.id,
    );
  }

  async findAll() {

    const rutas =
      await this.rutaRepository.find({
        relations: {
          sedes: {
            sede: true,
          },
        },
        order: {
          id: 'ASC',
        },
      });

    rutas.forEach(
      (ruta) => {

        ruta.sedes.sort(
          (a, b) =>
            a.orden - b.orden,
        );

      },
    );

    return rutas;
  }

  async findOne(
    id: number,
  ) {

    const rutaFound =
      await this.rutaRepository.findOne({
        where: {
          id: id,
        },
        relations: {
          sedes: {
            sede: true,
          },
        },
      });

    if (!rutaFound) {

      throw new NotFoundException(
        'La ruta no existe',
      );

    }

    rutaFound.sedes.sort(
      (a, b) =>
        a.orden - b.orden,
    );

    return rutaFound;
  }

  async update(
    id: number,
    ruta: UpdateRutaDto,
  ) {

    const rutaFound =
      await this.rutaRepository.findOne({
        where: {
          id: id,
        },
        relations: {
          sedes: {
            sede: true,
          },
        },
      });

    if (!rutaFound) {

      throw new NotFoundException(
        'La ruta no existe',
      );

    }

    if (
      ruta.name !== undefined
    ) {

      const rutaExist =
        await this.rutaRepository
          .findOneBy({
            name: ruta.name,
          });

      if (
        rutaExist &&
        rutaExist.id !== id
      ) {

        throw new ConflictException(
          'La ruta ya está registrada',
        );

      }

      rutaFound.name =
        ruta.name;
    }

    if (
      ruta.active !== undefined
    ) {

      rutaFound.active =
        ruta.active;

    }

    await this.rutaRepository.save(
      rutaFound,
    );

    if (
      ruta.sedes !== undefined
    ) {

      const sedes =
        await this.validateSedes(
          ruta.sedes,
        );

      if (
        rutaFound.sedes.length > 0
      ) {

        await this
          .rutaSedeRepository
          .remove(
            rutaFound.sedes,
          );

      }

      const detalles =
        ruta.sedes.map(
          (detalle) => {

            const sede =
              sedes.find(
                (item) =>
                  item.id ===
                  detalle.sedeId,
              );

            return this
              .rutaSedeRepository
              .create({
                ruta: rutaFound,
                sede: sede!,
                orden:
                  detalle.orden,
              });

          },
        );

      await this
        .rutaSedeRepository
        .save(
          detalles,
        );
    }

    return this.findOne(
      id,
    );
  }

  private async validateSedes(
    detalles: RutaSedeDto[],
  ) {

    const sedeIds =
      detalles.map(
        (detalle) =>
          detalle.sedeId,
      );

    const ordenes =
      detalles.map(
        (detalle) =>
          detalle.orden,
      );

    if (
      new Set(sedeIds).size !==
      sedeIds.length
    ) {

      throw new BadRequestException(
        'No se puede repetir una sede dentro de la misma ruta',
      );

    }

    if (
      new Set(ordenes).size !==
      ordenes.length
    ) {

      throw new BadRequestException(
        'No se puede repetir el orden de las sedes',
      );

    }

    const ordenesOrdenados =
      [...ordenes].sort(
        (a, b) =>
          a - b,
      );

    for (
      let index = 0;
      index <
      ordenesOrdenados.length;
      index++
    ) {

      if (
        ordenesOrdenados[index] !==
        index + 1
      ) {

        throw new BadRequestException(
          'El orden de las sedes debe ser consecutivo desde 1',
        );

      }

    }

    const sedes =
      await this.sedeRepository.find({
        where: {
          id: In(
            sedeIds,
          ),
          active: true,
        },
      });

    if (
      sedes.length !==
      sedeIds.length
    ) {

      throw new BadRequestException(
        'Una o más sedes no existen o están inactivas',
      );

    }

    return sedes;
  }

}