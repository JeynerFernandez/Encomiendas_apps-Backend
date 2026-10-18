import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type {
  Relation,
} from 'typeorm';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  EncomiendaEstado,
} from '../encomienda/encomienda-estado.enum.js';

import {
  Sede,
} from '../sedes/sede.entity.js';

@Entity({
  name: 'historial_encomienda',
})
export class HistorialEncomienda {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Encomienda,
    (encomienda) =>
      encomienda.historial,
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

  @ManyToOne(
    () => Sede,
    (sede) =>
      sede.historial_encomiendas,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'sede_id',
  })
  sede:
    Relation<Sede> | null;

  @Column({
    type: 'enum',
    enum: EncomiendaEstado,
  })
  estado:
    EncomiendaEstado;

  @Column({
    type: 'datetime',
    default: () =>
      'CURRENT_TIMESTAMP',
  })
  created_at:
    Date;

}