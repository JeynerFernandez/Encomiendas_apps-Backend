import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateTarifaDto {

  @IsNotEmpty()
  @IsInt()
  sedeOrigenId: number;

  @IsNotEmpty()
  @IsInt()
  sedeDestinoId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  precio_base: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  precio_kg_excedente: number;

}