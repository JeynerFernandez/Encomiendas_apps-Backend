import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  PagoModalidad,
} from '../../pagos/pago.entity.js';

export class UpdateEncomiendaDto {

  @IsOptional()
  @IsInt()
  remitenteId?: number;

  @IsOptional()
  @IsInt()
  destinatarioId?: number;

  @IsOptional()
  @IsInt()
  sedeOrigenId?: number;

  @IsOptional()
  @IsInt()
  sedeDestinoId?: number;

  @IsOptional()
  @IsInt()
  rutaId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  alto_cm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  ancho_cm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  largo_cm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  peso_kg?: number;

  @IsOptional()
  @IsEnum(PagoModalidad)
  modalidad_pago?: PagoModalidad;

  @IsOptional()
  @IsString()
  observacion?: string;

}