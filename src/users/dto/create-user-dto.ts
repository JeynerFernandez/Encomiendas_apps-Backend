import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty({
    example: 'Maria Recepcion',
    description: 'Nombre completo del usuario',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'maria@mandaya.com',
    description: 'Correo electrónico',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Maria123',
    description: 'Contraseña del usuario',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 2,
    description: 'ID del rol',
  })
  @IsInt()
  @Min(1)
  roleId: number;

  @ApiPropertyOptional({
    example: 1,
    nullable: true,
    description:
      'ID de la sede. RECEPCION y ALMACEN deben tener sede. MOVILIDAD y ADMINISTRADOR pueden usar null.',
  })
  @IsOptional()
  @ValidateIf(
    (_, value) =>
      value !== null &&
      value !== undefined,
  )
  @IsInt()
  @Min(1)
  sedeId?: number | null;

}