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
  Repository,
} from 'typeorm';
import { Tarifa } from './tarifa.entity.js';
import { Sede } from '../sedes/sede.entity.js';
import { CreateTarifaDto } from './dto/create-tarifa.dto.js';
import { UpdateTarifaDto } from './dto/update-tarifa.dto.js';

@Injectable()
export class TarifasService {

  constructor(

    @InjectRepository(Tarifa)
    private tarifaRepository:
      Repository<Tarifa>,

    @InjectRepository(Sede)
    private sedeRepository:
      Repository<Sede>,

  ) {}

  async create(
    tarifa: CreateTarifaDto,
  ) {

    if (
      tarifa.sedeOrigenId ===
      tarifa.sedeDestinoId
    ) {
      throw new BadRequestException(
        'La sede de origen y destino no pueden ser iguales',
      );
    }

    const origen =
      await this.sedeRepository.findOneBy({
        id: tarifa.sedeOrigenId,
        active: true,
      });

    if (!origen) {
      throw new NotFoundException(
        'La sede de origen no existe o está inactiva',
      );
    }

    const destino =
      await this.sedeRepository.findOneBy({
        id: tarifa.sedeDestinoId,
        active: true,
      });

    if (!destino) {
      throw new NotFoundException(
        'La sede de destino no existe o está inactiva',
      );
    }

    const tarifaExist =
      await this.tarifaRepository.findOne({
        where: {
          origen: {
            id: origen.id,
          },
          destino: {
            id: destino.id,
          },
        },
      });

    if (tarifaExist) {
      throw new ConflictException(
        'Ya existe una tarifa para estas sedes',
      );
    }

    const newTarifa =
      this.tarifaRepository.create({
        origen: origen,
        destino: destino,
        precio_base:
          tarifa.precio_base,
        precio_kg_excedente:
          tarifa.precio_kg_excedente,
        active: true,
      });

    return this.tarifaRepository.save(
      newTarifa,
    );
  }

  findAll() {

    return this.tarifaRepository.find({
      relations: {
        origen: true,
        destino: true,
      },
      order: {
        id: 'ASC',
      },
    });

  }

  async findOne(
    id: number,
  ) {

    const tarifaFound =
      await this.tarifaRepository.findOne({
        where: {
          id: id,
        },
        relations: {
          origen: true,
          destino: true,
        },
      });

    if (!tarifaFound) {
      throw new NotFoundException(
        'La tarifa no existe',
      );
    }

    return tarifaFound;
  }

  async findBySedes(
    origenId: number,
    destinoId: number,
  ) {

    const tarifaFound =
      await this.tarifaRepository.findOne({
        where: {
          origen: {
            id: origenId,
          },
          destino: {
            id: destinoId,
          },
          active: true,
        },
        relations: {
          origen: true,
          destino: true,
        },
      });

    if (!tarifaFound) {
      throw new NotFoundException(
        'No existe una tarifa disponible para esta ruta',
      );
    }

    return tarifaFound;
  }

  async update(
    id: number,
    tarifa: UpdateTarifaDto,
  ) {

    const tarifaFound =
      await this.tarifaRepository.findOne({
        where: {
          id: id,
        },
        relations: {
          origen: true,
          destino: true,
        },
      });

    if (!tarifaFound) {
      throw new NotFoundException(
        'La tarifa no existe',
      );
    }

    let origen =
      tarifaFound.origen;

    let destino =
      tarifaFound.destino;

    if (
      tarifa.sedeOrigenId !==
      undefined
    ) {

      const origenFound =
        await this.sedeRepository.findOneBy({
          id: tarifa.sedeOrigenId,
          active: true,
        });

      if (!origenFound) {
        throw new NotFoundException(
          'La sede de origen no existe o está inactiva',
        );
      }

      origen = origenFound;
    }

    if (
      tarifa.sedeDestinoId !==
      undefined
    ) {

      const destinoFound =
        await this.sedeRepository.findOneBy({
          id: tarifa.sedeDestinoId,
          active: true,
        });

      if (!destinoFound) {
        throw new NotFoundException(
          'La sede de destino no existe o está inactiva',
        );
      }

      destino = destinoFound;
    }

    if (
      origen.id ===
      destino.id
    ) {
      throw new BadRequestException(
        'La sede de origen y destino no pueden ser iguales',
      );
    }

    const tarifaExist =
      await this.tarifaRepository.findOne({
        where: {
          origen: {
            id: origen.id,
          },
          destino: {
            id: destino.id,
          },
        },
      });

    if (
      tarifaExist &&
      tarifaExist.id !== id
    ) {
      throw new ConflictException(
        'Ya existe una tarifa para estas sedes',
      );
    }

    tarifaFound.origen =
      origen;

    tarifaFound.destino =
      destino;

    if (
      tarifa.precio_base !==
      undefined
    ) {
      tarifaFound.precio_base =
        tarifa.precio_base;
    }

    if (
      tarifa.precio_kg_excedente !==
      undefined
    ) {
      tarifaFound.precio_kg_excedente =
        tarifa.precio_kg_excedente;
    }

    if (
      tarifa.active !==
      undefined
    ) {
      tarifaFound.active =
        tarifa.active;
    }

    return this.tarifaRepository.save(
      tarifaFound,
    );
  }

}