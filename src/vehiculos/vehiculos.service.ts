import {
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

import {
  Vehiculo,
} from './vehiculo.entity.js';

import {
  CreateVehiculoDto,
} from './dto/create-vehiculo.dto.js';

import {
  UpdateVehiculoDto,
} from './dto/update-vehiculo.dto.js';


@Injectable()
export class VehiculosService {

  constructor(

    @InjectRepository(
      Vehiculo,
    )
    private vehiculoRepository:
      Repository<Vehiculo>,

  ) {}



  async create(
    vehiculo:
      CreateVehiculoDto,
  ) {

    const vehiculoExist =
      await this.vehiculoRepository
        .findOneBy({
          placa:
            vehiculo.placa,
        });


    if (
      vehiculoExist
    ) {

      throw new ConflictException(
        'La placa ya está registrada',
      );

    }


    const newVehiculo =
      this.vehiculoRepository.create({

        placa:
          vehiculo.placa,

        descripcion:
          vehiculo.descripcion,

        capacidad_kg:
          vehiculo.capacidadKg,

        active:
          true,

      });


    return this.vehiculoRepository.save(
      newVehiculo,
    );

  }



  findAll() {

    return this.vehiculoRepository.find({

      order: {
        id: 'ASC',
      },

    });

  }



  async findOne(
    id: number,
  ) {

    const vehiculoFound =
      await this.vehiculoRepository
        .findOneBy({
          id: id,
        });


    if (
      !vehiculoFound
    ) {

      throw new NotFoundException(
        'El vehículo no existe',
      );

    }


    return vehiculoFound;

  }



  async update(
    id: number,
    vehiculo:
      UpdateVehiculoDto,
  ) {

    const vehiculoFound =
      await this.vehiculoRepository
        .findOneBy({
          id: id,
        });


    if (
      !vehiculoFound
    ) {

      throw new NotFoundException(
        'El vehículo no existe',
      );

    }



    if (
      vehiculo.placa !==
      undefined
    ) {

      const vehiculoExist =
        await this.vehiculoRepository
          .findOneBy({
            placa:
              vehiculo.placa,
          });


      if (
        vehiculoExist &&
        vehiculoExist.id !== id
      ) {

        throw new ConflictException(
          'La placa ya está registrada',
        );

      }


      vehiculoFound.placa =
        vehiculo.placa;

    }



    if (
      vehiculo.descripcion !==
      undefined
    ) {

      vehiculoFound.descripcion =
        vehiculo.descripcion;

    }



    if (
      vehiculo.capacidadKg !==
      undefined
    ) {

      vehiculoFound.capacidad_kg =
        vehiculo.capacidadKg;

    }



    if (
      vehiculo.active !==
      undefined
    ) {

      vehiculoFound.active =
        vehiculo.active;

    }



    return this.vehiculoRepository.save(
      vehiculoFound,
    );

  }

}