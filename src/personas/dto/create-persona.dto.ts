import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreatePersonaDto {

  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  @Matches(/^\d{8}$/)
  dni: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  nombres: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  apellido_paterno: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  apellido_materno: string;

}