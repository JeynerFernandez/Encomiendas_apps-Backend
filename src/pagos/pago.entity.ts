import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type {
  Relation,
} from 'typeorm';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

export enum PagoModalidad {
  ORIGEN = 'ORIGEN',
  DESTINO = 'DESTINO',
}

export enum PagoEstado {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
}

@Entity({
  name: 'pagos',
})
export class Pago {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => Encomienda,
    (encomienda) =>
      encomienda.pago,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'encomienda_id',
  })
  encomienda:
    Relation<Encomienda>;

  @Column({
    type: 'enum',
    enum: PagoModalidad,
  })
  modalidad:
    PagoModalidad;

  @Column({
    type: 'enum',
    enum: PagoEstado,
    default:
      PagoEstado.PENDIENTE,
  })
  estado:
    PagoEstado;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  monto:
    number;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  pagado_at:
    Date | null;

  @Column({
    type: 'datetime',
    default: () =>
      'CURRENT_TIMESTAMP',
  })
  created_at:
    Date;

  @Column({
    type: 'datetime',
    default: () =>
      'CURRENT_TIMESTAMP',
    onUpdate:
      'CURRENT_TIMESTAMP',
  })
  updated_at:
    Date;

}