import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class UpdateUserDto {

  @ApiPropertyOptional({
    example: 'Maria Recepcion',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'maria@mandaya.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'Maria123',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'ID del rol',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  roleId?: number;

  @ApiPropertyOptional({
    example: 1,
    nullable: true,
    description: 'ID de sede o null',
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

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

}