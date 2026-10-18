import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  AuthService,
} from './auth.service.js';

import {
  LoginAuthDto,
} from './dto/login-auth.dto.js';

import {
  RegisterAuthDto,
} from './dto/register-auth.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService:
      AuthService,
  ) {}

  @ApiOperation({
    summary:
      'Registrar cliente',
    description:
      'Registra un usuario con rol CLIENTE automáticamente.',
  })
  @ApiBody({
    type:
      RegisterAuthDto,
  })
  @Post('register')
  register(
    @Body()
    user:
      RegisterAuthDto,
  ) {

    return this.authService
      .register(
        user,
      );

  }

  @ApiOperation({
    summary:
      'Crear primer administrador',
    description:
      'Solo funciona si todavía no existe ningún usuario ADMINISTRADOR.',
  })
  @ApiBody({
    type:
      RegisterAuthDto,
  })
  @Post('bootstrap-admin')
  bootstrapAdmin(
    @Body()
    user:
      RegisterAuthDto,
  ) {

    return this.authService
      .bootstrapAdmin(
        user,
      );

  }

  @ApiOperation({
    summary:
      'Iniciar sesión',
  })
  @ApiBody({
    type:
      LoginAuthDto,
  })
  @Post('login')
  login(
    @Body()
    loginData:
      LoginAuthDto,
  ) {

    return this.authService
      .login(
        loginData,
      );

  }

}