import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import type {
  Relation,
} from 'typeorm';

import {
  Traslado,
} from '../traslados/traslado.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

@Entity({
  name: 'traslado_encomienda',
})
@Unique([
  'traslado',
  'encomienda',
])
export class TrasladoEncomienda {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Traslado,
    (traslado) =>
      traslado.encomiendas,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'traslado_id',
  })
  traslado:
    Relation<Traslado>;

  @ManyToOne(
    () => Encomienda,
    (encomienda) =>
      encomienda.traslados,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'encomienda_id',
  })
  encomienda:
    Relation<Encomienda>;

  @Column({
    type: 'datetime',
    default: () =>
      'CURRENT_TIMESTAMP',
  })
  asignado_at: Date;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  descargado_at:
    Date | null;

}