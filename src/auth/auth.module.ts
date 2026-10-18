import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt/jwt.strategy.js';
import { jwtConstants } from './jwt/jwt.constants.js';
import { User } from '../users/user.entity.js';
import { Rol } from '../roles/rol.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Rol,
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '6h',
      },
    }),
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    JwtStrategy,
  ],
})
export class AuthModule {}