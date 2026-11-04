import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateVehiculoDto {

  @IsOptional()
  @IsString()
  placa?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(1)
  capacidadKg?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

}