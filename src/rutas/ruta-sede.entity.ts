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
  Ruta,
} from './ruta.entity.js';

import {
  Sede,
} from '../sedes/sede.entity.js';

@Entity({
  name: 'ruta_sedes',
})
@Unique([
  'ruta',
  'sede',
])
@Unique([
  'ruta',
  'orden',
])
export class RutaSede {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Ruta,
    (ruta) =>
      ruta.sedes,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'ruta_id',
  })
  ruta:
    Relation<Ruta>;

  @ManyToOne(
    () => Sede,
    (sede) =>
      sede.rutas,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'sede_id',
  })
  sede:
    Relation<Sede>;

  @Column({
    type: 'int',
  })
  orden: number;

}