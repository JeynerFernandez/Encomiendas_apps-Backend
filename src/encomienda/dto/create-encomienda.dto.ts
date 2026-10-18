import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  PagoModalidad,
} from '../../pagos/pago.entity.js';

export class CreateEncomiendaDto {

  @ApiProperty({
    example: 1,
    description:
      'ID de la persona remitente',
  })
  @IsNotEmpty()
  @IsInt()
  remitenteId: number;

  @ApiProperty({
    example: 2,
    description:
      'ID de la persona destinataria',
  })
  @IsNotEmpty()
  @IsInt()
  destinatarioId: number;

  @ApiProperty({
    example: 1,
    description:
      'ID de la sede de origen',
  })
  @IsNotEmpty()
  @IsInt()
  sedeOrigenId: number;

  @ApiProperty({
    example: 2,
    description:
      'ID de la sede de destino',
  })
  @IsNotEmpty()
  @IsInt()
  sedeDestinoId: number;

  @ApiProperty({
    example: 10,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  alto_cm: number;

  @ApiProperty({
    example: 10,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  ancho_cm: number;

  @ApiProperty({
    example: 10,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  largo_cm: number;

  @ApiProperty({
    example: 10,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  peso_kg: number;

  @ApiProperty({
    enum: PagoModalidad,
    example: PagoModalidad.ORIGEN,
    description:
      'Lugar donde se realizará el pago',
  })
  @IsNotEmpty()
  @IsEnum(PagoModalidad)
  modalidad_pago: PagoModalidad;

  @ApiPropertyOptional({
    example:
      'Delicado, es una televisión',
  })
  @IsOptional()
  @IsString()
  observacion?: string;

}