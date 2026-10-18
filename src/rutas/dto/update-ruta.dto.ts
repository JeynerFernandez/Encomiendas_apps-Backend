import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RutaSedeDto } from './create-ruta.dto.js';

export class UpdateRutaDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({
    each: true,
  })
  @Type(() => RutaSedeDto)
  sedes?: RutaSedeDto[];

}