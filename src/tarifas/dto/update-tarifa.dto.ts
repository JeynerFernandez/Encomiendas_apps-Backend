import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateTarifaDto {

  @IsOptional()
  @IsInt()
  sedeOrigenId?: number;

  @IsOptional()
  @IsInt()
  sedeDestinoId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  precio_base?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  precio_kg_excedente?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

}