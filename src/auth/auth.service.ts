import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  compare,
  hash,
} from 'bcrypt';

import {
  JwtService,
} from '@nestjs/jwt';

import {
  User,
} from '../users/user.entity.js';

import {
  Rol,
} from '../roles/rol.entity.js';

import {
  RegisterAuthDto,
} from './dto/register-auth.dto.js';

import {
  LoginAuthDto,
} from './dto/login-auth.dto.js';

import {
  JwtRole,
} from './jwt/jwt-role.js';

@Injectable()
export class AuthService {

  constructor(

    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,

    @InjectRepository(Rol)
    private readonly rolesRepository:
      Repository<Rol>,

    private readonly jwtService:
      JwtService,

  ) {}

  async register(
    user: RegisterAuthDto,
  ) {

    const {
      name,
      email,
      password,
    } = user;

    const emailExist =
      await this.userRepository
        .findOneBy({
          email,
        });

    if (emailExist) {

      throw new ConflictException(
        'El correo ya está registrado',
      );

    }

    const clientRole =
      await this.rolesRepository
        .findOneBy({
          name:
            JwtRole.CLIENTE,
        });

    if (!clientRole) {

      throw new InternalServerErrorException(
        'El rol CLIENTE no está registrado',
      );

    }

    const passwordHash =
      await hash(
        password,
        10,
      );

    const newUser =
      this.userRepository
        .create({
          name,
          email,
          password:
            passwordHash,
          active:
            true,
          sedeId:
            null,
          notification_token:
            null,
          role:
            clientRole,
        });

    const userSaved =
      await this.userRepository
        .save(
          newUser,
        );

    const token =
      this.generarToken(
        userSaved,
        clientRole,
      );

    const {
      password: _,
      ...userWithoutPassword
    } = userSaved;

    return {
      user:
        userWithoutPassword,

      access_token:
        token,
    };
  }

  async bootstrapAdmin(
    user: RegisterAuthDto,
  ) {

    const adminRole =
      await this.rolesRepository
        .findOneBy({
          name:
            JwtRole.ADMINISTRADOR,
        });

    if (!adminRole) {

      throw new InternalServerErrorException(
        'El rol ADMINISTRADOR no está registrado',
      );

    }

    const adminExist =
      await this.userRepository
        .findOne({
          where: {
            role: {
              id:
                adminRole.id,
            },
          },

          relations: {
            role:
              true,
          },
        });

    if (adminExist) {

      throw new ConflictException(
        'Ya existe un administrador. Este endpoint solo puede utilizarse para crear el primer administrador',
      );

    }

    const emailExist =
      await this.userRepository
        .findOneBy({
          email:
            user.email,
        });

    if (emailExist) {

      throw new ConflictException(
        'El correo ya está registrado',
      );

    }

    const passwordHash =
      await hash(
        user.password,
        10,
      );

    const newAdmin =
      this.userRepository
        .create({
          name:
            user.name,

          email:
            user.email,

          password:
            passwordHash,

          active:
            true,

          sedeId:
            null,

          notification_token:
            null,

          role:
            adminRole,
        });

    const adminSaved =
      await this.userRepository
        .save(
          newAdmin,
        );

    const token =
      this.generarToken(
        adminSaved,
        adminRole,
      );

    const {
      password: _,
      ...adminWithoutPassword
    } = adminSaved;

    return {
      message:
        'Administrador principal creado correctamente',

      user:
        adminWithoutPassword,

      access_token:
        token,
    };
  }

  async login(
    loginData: LoginAuthDto,
  ) {

    const {
      email,
      password,
    } = loginData;

    const userFound =
      await this.userRepository
        .findOne({
          where: {
            email,
          },

          relations: {
            role:
              true,
          },
        });

    if (!userFound) {

      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );

    }

    if (!userFound.active) {

      throw new UnauthorizedException(
        'El usuario se encuentra inactivo',
      );

    }

    const isPasswordValid =
      await compare(
        password,
        userFound.password,
      );

    if (!isPasswordValid) {

      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );

    }

    if (!userFound.role) {

      throw new UnauthorizedException(
        'El usuario no tiene un rol asignado',
      );

    }

    const token =
      this.generarToken(
        userFound,
        userFound.role,
      );

    const {
      password: _,
      ...userWithoutPassword
    } = userFound;

    return {
      user:
        userWithoutPassword,

      access_token:
        token,
    };
  }

  private generarToken(
    user: User,
    role: Rol,
  ) {

    const payload = {

      userId:
        user.id,

      id:
        user.id,

      name:
        user.name,

      email:
        user.email,

      role:
        role.name,

      sedeId:
        user.sedeId,

    };

    return this.jwtService
      .sign(
        payload,
      );
  }

}