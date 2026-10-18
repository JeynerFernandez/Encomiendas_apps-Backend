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
  Sede,
} from '../sedes/sede.entity.js';

@Entity({
  name: 'tarifas',
})
@Unique([
  'origen',
  'destino',
])
export class Tarifa {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Sede,
    (sede) =>
      sede.tarifas_origen,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'sede_origen_id',
  })
  origen:
    Relation<Sede>;

  @ManyToOne(
    () => Sede,
    (sede) =>
      sede.tarifas_destino,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'sede_destino_id',
  })
  destino:
    Relation<Sede>;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  precio_base: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  precio_kg_excedente: number;

  @Column({
    type: 'boolean',
    default: true,
  })
  active: boolean;

  @Column({
    type: 'datetime',
    default: () =>
      'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'datetime',
    default: () =>
      'CURRENT_TIMESTAMP',
    onUpdate:
      'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

}