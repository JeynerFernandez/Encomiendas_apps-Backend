import {
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  JwtRole,
} from '../../auth/jwt/jwt-role.js';

export class CreateRolDto {

  @ApiProperty({
    enum: JwtRole,
    example: JwtRole.CLIENTE,
    description: 'Rol del usuario',
  })
  @IsNotEmpty()
  @IsEnum(JwtRole)
  name: JwtRole;

}