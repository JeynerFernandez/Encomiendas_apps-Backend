import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type {
  Relation,
} from 'typeorm';

import {
  Encomienda,
} from '../encomienda/encomienda.entity.js';

import {
  User,
} from '../users/user.entity.js';

@Entity({
  name: 'entregas',
})
export class Entrega {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => Encomienda,
    (encomienda) =>
      encomienda.entrega,
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
    () => User,
    (user) =>
      user.entregas_realizadas,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'usuario_entrega_id',
  })
  usuario_entrega:
    Relation<User>;

  @Column({
    type: 'varchar',
    length: 8,
  })
  dni_receptor:
    string;

  @Column({
    type: 'datetime',
  })
  entregado_at:
    Date;

}