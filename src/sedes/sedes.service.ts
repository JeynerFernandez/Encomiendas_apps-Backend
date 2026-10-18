import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sede } from './sede.entity.js';
import { CreateSedeDto } from './dto/create-sede.dto.js';
import { UpdateSedeDto } from './dto/update-sede.dto.js';

@Injectable()
export class SedesService {

  constructor(
    @InjectRepository(Sede)
    private sedeRepository: Repository<Sede>,
  ) {}

  async create(sede: CreateSedeDto) {

    const sedeExist =
      await this.sedeRepository.findOneBy({
        name: sede.name,
      });

    if (sedeExist) {
      throw new ConflictException(
        'La sede ya está registrada',
      );
    }

    const newSede =
      this.sedeRepository.create({
        name: sede.name,
        city: sede.city,
        address: sede.address,
        latitude: sede.latitude,
        longitude: sede.longitude,
        active: true,
      });

    return this.sedeRepository.save(
      newSede,
    );
  }

  findAll() {

    return this.sedeRepository.find({
      order: {
        id: 'ASC',
      },
    });

  }

  async findOne(id: number) {

    const sedeFound =
      await this.sedeRepository.findOneBy({
        id: id,
      });

    if (!sedeFound) {
      throw new NotFoundException(
        'La sede no existe',
      );
    }

    return sedeFound;
  }

  async update(
    id: number,
    sede: UpdateSedeDto,
  ) {

    const sedeFound =
      await this.sedeRepository.findOneBy({
        id: id,
      });

    if (!sedeFound) {
      throw new NotFoundException(
        'La sede no existe',
      );
    }

    if (sede.name !== undefined) {

      const sedeExist =
        await this.sedeRepository.findOneBy({
          name: sede.name,
        });

      if (
        sedeExist &&
        sedeExist.id !== id
      ) {
        throw new ConflictException(
          'La sede ya está registrada',
        );
      }

    }

    const updatedSede =
      Object.assign(
        sedeFound,
        sede,
      );

    return this.sedeRepository.save(
      updatedSede,
    );
  }

}