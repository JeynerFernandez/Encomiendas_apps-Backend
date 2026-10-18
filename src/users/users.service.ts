import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { User } from './user.entity.js';
import { Rol } from '../roles/rol.entity.js';
import { CreateUserDto } from './dto/create-user-dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Rol)
    private rolesRepository: Repository<Rol>,
  ) {}

  async create(user: CreateUserDto) {

    const emailExist =
      await this.userRepository.findOneBy({
        email: user.email,
      });

    if (emailExist) {
      throw new ConflictException(
        'El correo ya está registrado',
      );
    }

    const role =
      await this.rolesRepository.findOneBy({
        id: user.roleId,
      });

    if (!role) {
      throw new NotFoundException(
        'El rol no existe',
      );
    }

    const passwordHash =
      await hash(
        user.password,
        10,
      );

    const newUser =
      this.userRepository.create({
        name: user.name,
        email: user.email,
        password: passwordHash,
        active: true,
        sedeId: user.sedeId ?? null,
        notification_token: null,
        role: role,
      });

    const userSaved =
      await this.userRepository.save(
        newUser,
      );

    const {
      password,
      ...userWithoutPassword
    } = userSaved;

    return userWithoutPassword;
  }

  findAll() {
  return this.userRepository.find({
    relations: {
      role: true,
    },
  });
}

  async update(
    id: number,
    user: UpdateUserDto,
  ) {

    const userFound =
  await this.userRepository.findOne({
    where: {
      id: id,
    },
    relations: {
      role: true,
    },
  });

    if (!userFound) {
      throw new NotFoundException(
        'El usuario no existe',
      );
    }

    if (user.name !== undefined) {
      userFound.name = user.name;
    }

    if (user.email !== undefined) {

      const emailExist =
        await this.userRepository.findOneBy({
          email: user.email,
        });

      if (
        emailExist &&
        emailExist.id !== id
      ) {
        throw new ConflictException(
          'El correo ya está registrado',
        );
      }

      userFound.email =
        user.email;
    }

    if (user.active !== undefined) {
      userFound.active =
        user.active;
    }

    if (user.sedeId !== undefined) {
      userFound.sedeId =
        user.sedeId;
    }

    if (user.roleId !== undefined) {

      const role =
        await this.rolesRepository.findOneBy({
          id: user.roleId,
        });

      if (!role) {
        throw new NotFoundException(
          'El rol no existe',
        );
      }

      userFound.role =
        role;
    }

    const userSaved =
      await this.userRepository.save(
        userFound,
      );

    const {
      password,
      ...userWithoutPassword
    } = userSaved;

    return userWithoutPassword;
  }

}