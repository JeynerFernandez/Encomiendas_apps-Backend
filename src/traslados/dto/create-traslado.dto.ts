import {
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateTrasladoDto {

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  rutaId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  vehiculoId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  conductorId: number;

}