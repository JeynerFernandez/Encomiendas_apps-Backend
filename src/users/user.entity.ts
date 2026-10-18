import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  Rol,
} from '../roles/rol.entity.js';

import {
  Traslado,
} from '../traslados/traslado.entity.js';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  Entrega,
} from '../entregas/entrega.entity.js';

import {
  Incidencia,
} from '../incidencias/incidencia.entity.js';

@Entity({
  name: 'users',
})
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    default: true,
  })
  active: boolean;

  @Column({
    type: 'int',
    nullable: true,
  })
  sedeId: number | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  notification_token:
    string | null;

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

  @ManyToOne(
    () => Rol,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'rol_id',
  })
  role: Rol;

  @OneToMany(
    () => Traslado,
    (traslado) =>
      traslado.conductor,
  )
  traslados:
    Traslado[];

  @OneToMany(
    () => Encomienda,
    (encomienda) =>
      encomienda.usuario_registra,
  )
  encomiendas_registradas:
    Encomienda[];

  @OneToMany(
    () => Entrega,
    (entrega) =>
      entrega.usuario_entrega,
  )
  entregas_realizadas:
    Entrega[];

  @OneToMany(
    () => Incidencia,
    (incidencia) =>
      incidencia.usuario_reporta,
  )
  incidencias_reportadas:
    Incidencia[];

}