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
  Rol,
} from './rol.entity.js';

import {
  CreateRolDto,
} from './dto/create-rol.dto.js';

@Injectable()
export class RolesService {

  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository:
      Repository<Rol>,
  ) {}

  findAll() {

    return this.rolRepository.find({
      order: {
        id: 'ASC',
      },
    });

  }

  async findOne(
    id: number,
  ) {

    const rolFound =
      await this.rolRepository.findOneBy({
        id,
      });

    if (!rolFound) {

      throw new NotFoundException(
        'El rol no existe',
      );

    }

    return rolFound;
  }

  async findByName(
    name: string,
  ) {

    return this.rolRepository.findOneBy({
      name,
    });

  }

  async create(
    rol: CreateRolDto,
  ) {

    const rolExist =
      await this.rolRepository.findOneBy({
        name: rol.name,
      });

    if (rolExist) {

      throw new ConflictException(
        'El rol ya existe',
      );

    }

    const newRol =
      this.rolRepository.create({
        name: rol.name,
        active: true,
      });

    return await this.rolRepository.save(
      newRol,
    );
  }
}