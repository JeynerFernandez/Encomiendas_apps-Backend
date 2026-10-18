import {
  IsEnum,
  IsOptional,
} from 'class-validator';

import {
  PagoModalidad,
} from '../pago.entity.js';

export class UpdatePagoDto {

  @IsOptional()
  @IsEnum(PagoModalidad)
  modalidad?: PagoModalidad;

}