import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

export class CreateIncidenciaDto {

  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  tipoIncidenciaId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  descripcion: string;

}