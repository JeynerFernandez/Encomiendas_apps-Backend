import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateVehiculoDto {

  @IsOptional()
  @IsString()
  placa?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

}