import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type {
  Relation,
} from 'typeorm';

import {
  Ruta,
} from '../rutas/ruta.entity.js';

import {
  Vehiculo,
} from '../vehiculos/vehiculo.entity.js';

import {
  User,
} from '../users/user.entity.js';

import {
  TrasladoEncomienda,
} from '../traslado-encomienda/traslado-encomienda.entity.js';

import {
  Incidencia,
} from '../incidencias/incidencia.entity.js';

import {
  UbicacionTraslado,
} from '../ubicacion-traslado/ubicacion-traslado.entity.js';

export enum TrasladoEstado {
  PROGRAMADO = 'PROGRAMADO',
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

@Entity({
  name: 'traslados',
})
export class Traslado {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Ruta,
    (ruta) =>
      ruta.traslados,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'ruta_id',
  })
  ruta:
    Relation<Ruta>;

  @ManyToOne(
    () => Vehiculo,
    (vehiculo) =>
      vehiculo.traslados,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'vehiculo_id',
  })
  vehiculo:
    Relation<Vehiculo>;

  @ManyToOne(
    () => User,
    (user) =>
      user.traslados,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'conductor_id',
  })
  conductor:
    Relation<User>;

  @Column({
    type: 'enum',
    enum: TrasladoEstado,
    default:
      TrasladoEstado.PROGRAMADO,
  })
  estado:
    TrasladoEstado;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  salida_at:
    Date | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  llegada_at:
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

  @OneToMany(
    () => TrasladoEncomienda,
    (detalle) =>
      detalle.traslado,
  )
  encomiendas:
    Relation<TrasladoEncomienda[]>;

  @OneToMany(
    () => Incidencia,
    (incidencia) =>
      incidencia.traslado,
  )
  incidencias:
    Relation<Incidencia[]>;

  @OneToOne(
    () => UbicacionTraslado,
    (ubicacion) =>
      ubicacion.traslado,
  )
  ubicacion:
    Relation<UbicacionTraslado>;

}