import {
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateTrasladoEncomiendaDto {

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  trasladoId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  encomiendaId: number;

}