import {
  IsNotEmpty,
  IsNumber,
  Max,
  Min,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

export class UpdateUbicacionTrasladoDto {

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;

}