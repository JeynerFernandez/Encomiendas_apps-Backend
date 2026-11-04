import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RastrearEncomiendaDto {

  @IsNotEmpty()
  @IsString()
  codigoRastreo: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  @Matches(
    /^[0-9]{4}$/,
    {
      message:
        'La clave debe contener exactamente 4 dígitos',
    },
  )
  clave: string;

}