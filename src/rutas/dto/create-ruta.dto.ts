import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RutaSedeDto {

  @IsInt()
  sedeId: number;

  @IsInt()
  @Min(1)
  orden: number;

}

export class CreateRutaDto {

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({
    each: true,
  })
  @Type(() => RutaSedeDto)
  sedes: RutaSedeDto[];

}