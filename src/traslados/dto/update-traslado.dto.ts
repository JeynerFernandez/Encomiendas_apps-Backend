import {
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateTrasladoDto {

  @IsOptional()
  @IsInt()
  @Min(1)
  rutaId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  vehiculoId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  conductorId?: number;

}