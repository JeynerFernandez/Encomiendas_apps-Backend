import {
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class CreateEntregaDto {

  @IsNotEmpty()
  @IsString()
  @Matches(
    /^\d{8}$/,
    {
      message:
        'El DNI debe contener exactamente 8 dígitos',
    },
  )
  dni: string;

  @IsNotEmpty()
  @IsString()
  @Matches(
    /^\d{4}$/,
    {
      message:
        'La clave debe contener exactamente 4 dígitos',
    },
  )
  clave: string;

}