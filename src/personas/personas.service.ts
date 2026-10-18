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

import {
  Persona,
} from './persona.entity.js';

import {
  CreatePersonaDto,
} from './dto/create-persona.dto.js';

import {
  UpdatePersonaDto,
} from './dto/update-persona.dto.js';

import {
  FactilizaService,
} from '../factiliza/factiliza.service.js';

@Injectable()
export class PersonasService {

  constructor(

    @InjectRepository(
      Persona,
    )
    private readonly personaRepository:
      Repository<Persona>,

    private readonly factilizaService:
      FactilizaService,

  ) {}

  async create(
    persona: CreatePersonaDto,
  ) {

    this.validateDni(
      persona.dni,
    );

    const personaExist =
      await this.personaRepository
        .findOneBy({
          dni:
            persona.dni,
        });

    if (personaExist) {

      throw new ConflictException(
        'El DNI ya está registrado',
      );

    }

    const newPersona =
      this.personaRepository
        .create({

          dni:
            persona.dni,

          nombres:
            persona.nombres,

          apellido_paterno:
            persona.apellido_paterno,

          apellido_materno:
            persona.apellido_materno,

        });

    return await this
      .personaRepository
      .save(
        newPersona,
      );
  }

  findAll() {

    return this.personaRepository
      .find({
        order: {
          id:
            'ASC',
        },
      });

  }

  async findOne(
    id: number,
  ) {

    const personaFound =
      await this.personaRepository
        .findOneBy({
          id,
        });

    if (!personaFound) {

      throw new NotFoundException(
        'La persona no existe',
      );

    }

    return personaFound;
  }

  async findByDni(
    dni: string,
  ) {

    this.validateDni(
      dni,
    );

    const personaFound =
      await this.personaRepository
        .findOneBy({
          dni,
        });

    if (personaFound) {

      return personaFound;

    }

    const datosFactiliza =
      await this.factilizaService
        .consultarDni(
          dni,
        );

    const personaExistente =
      await this.personaRepository
        .findOneBy({
          dni:
            datosFactiliza.numero,
        });

    if (personaExistente) {

      return personaExistente;

    }

    const newPersona =
      this.personaRepository
        .create({

          dni:
            datosFactiliza.numero,

          nombres:
            datosFactiliza.nombres,

          apellido_paterno:
            datosFactiliza
              .apellido_paterno,

          apellido_materno:
            datosFactiliza
              .apellido_materno,

        });

    return await this
      .personaRepository
      .save(
        newPersona,
      );
  }

  async update(
    id: number,
    persona: UpdatePersonaDto,
  ) {

    const personaFound =
      await this.personaRepository
        .findOneBy({
          id,
        });

    if (!personaFound) {

      throw new NotFoundException(
        'La persona no existe',
      );

    }

    if (
      persona.dni !== undefined
    ) {

      this.validateDni(
        persona.dni,
      );

      const personaDniExist =
        await this.personaRepository
          .findOneBy({
            dni:
              persona.dni,
          });

      if (
        personaDniExist &&
        personaDniExist.id !== id
      ) {

        throw new ConflictException(
          'El DNI ya está registrado por otra persona',
        );

      }
    }

    const updatedPersona =
      Object.assign(
        personaFound,
        persona,
      );

    return await this
      .personaRepository
      .save(
        updatedPersona,
      );
  }

  private validateDni(
    dni: string,
  ) {

    if (
      !/^\d{8}$/.test(
        dni,
      )
    ) {

      throw new BadRequestException(
        'El DNI debe tener 8 dígitos',
      );

    }
  }
}