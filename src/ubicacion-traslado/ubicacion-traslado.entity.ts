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
  Traslado,
} from '../traslados/traslado.entity.js';

@Entity({
  name: 'ubicacion_traslado',
})
export class UbicacionTraslado {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => Traslado,
    (traslado) =>
      traslado.ubicacion,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'traslado_id',
  })
  traslado:
    Relation<Traslado>;

  @Column({
    type: 'double',
  })
  latitud: number;

  @Column({
    type: 'double',
  })
  longitud: number;

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