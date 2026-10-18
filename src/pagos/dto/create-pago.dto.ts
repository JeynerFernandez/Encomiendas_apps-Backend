import {
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

import {
  PagoModalidad,
} from '../pago.entity.js';

export class CreatePagoDto {

  @IsNotEmpty()
  @IsEnum(PagoModalidad)
  modalidad: PagoModalidad;

}