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
  Traslado,
} from '../traslados/traslado.entity.js';

import {
  TipoIncidencia,
} from '../tipos-incidencia/tipo-incidencia.entity.js';

import {
  User,
} from '../users/user.entity.js';

@Entity({
  name: 'incidencias',
})
export class Incidencia {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Traslado,
    (traslado) =>
      traslado.incidencias,
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
    () => TipoIncidencia,
    (tipo) =>
      tipo.incidencias,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'tipo_incidencia_id',
  })
  tipo:
    Relation<TipoIncidencia>;

  @ManyToOne(
    () => User,
    (user) =>
      user.incidencias_reportadas,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'usuario_reporta_id',
  })
  usuario_reporta:
    Relation<User>;

  @Column({
    type: 'text',
  })
  descripcion: string;

  @Column({
    type: 'varchar',
    length: 1000,
  })
  imagen_url: string;

  @Column({
    type: 'datetime',
    default: () =>
      'CURRENT_TIMESTAMP',
  })
  created_at: Date;

}