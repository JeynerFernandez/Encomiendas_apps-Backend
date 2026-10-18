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
  Persona,
} from '../personas/persona.entity.js';

import {
  Sede,
} from '../sedes/sede.entity.js';

import {
  User,
} from '../users/user.entity.js';

import {
  TrasladoEncomienda,
} from '../traslado-encomienda/traslado-encomienda.entity.js';

import {
  HistorialEncomienda,
} from '../historial-encomienda/historial-encomienda.entity.js';

import {
  Pago,
} from '../pagos/pago.entity.js';

import {
  Entrega,
} from '../entregas/entrega.entity.js';

import {
  EncomiendaEstado,
} from './encomienda-estado.enum.js';

@Entity({
  name: 'encomienda',
})
export class Encomienda {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    unique: true,
  })
  codigo_rastreo: string;

  @Column({
    type: 'varchar',
  })
  clave_rastreo_hash: string;

  @ManyToOne(
    () => Persona,
    (persona) =>
      persona.encomiendas_enviadas,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'remitente_id',
  })
  remitente:
    Relation<Persona>;

  @ManyToOne(
    () => Persona,
    (persona) =>
      persona.encomiendas_recibidas,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'destinatario_id',
  })
  destinatario:
    Relation<Persona>;

  @ManyToOne(
    () => Sede,
    (sede) =>
      sede.encomiendas_origen,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'sede_origen_id',
  })
  sede_origen:
    Relation<Sede>;

  @ManyToOne(
    () => Sede,
    (sede) =>
      sede.encomiendas_destino,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'sede_destino_id',
  })
  sede_destino:
    Relation<Sede>;

  @ManyToOne(
    () => Sede,
    (sede) =>
      sede.encomiendas_actuales,
    {
      nullable: true,
    },
  )
  @JoinColumn({
    name: 'ultima_sede_id',
  })
  ultima_sede:
    Relation<Sede> | null;

  @ManyToOne(
    () => User,
    (user) =>
      user.encomiendas_registradas,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'usuario_registra_id',
  })
  usuario_registra:
    Relation<User>;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
  })
  alto_cm: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
  })
  ancho_cm: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
  })
  largo_cm: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
  })
  peso_kg: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  costo_total: number;

  @Column({
    type: 'enum',
    enum: EncomiendaEstado,
    default:
      EncomiendaEstado.REGISTRADO,
  })
  estado:
    EncomiendaEstado;

  @Column({
    type: 'text',
    nullable: true,
  })
  observacion:
    string | null;

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

  @Column({
    type: 'datetime',
    nullable: true,
  })
  entregado_at:
    Date | null;

  @OneToMany(
    () => TrasladoEncomienda,
    (detalle) =>
      detalle.encomienda,
  )
  traslados:
    Relation<TrasladoEncomienda[]>;

  @OneToMany(
    () => HistorialEncomienda,
    (historial) =>
      historial.encomienda,
  )
  historial:
    Relation<HistorialEncomienda[]>;

  @OneToOne(
    () => Pago,
    (pago) =>
      pago.encomienda,
  )
  pago:
    Relation<Pago>;

  @OneToOne(
    () => Entrega,
    (entrega) =>
      entrega.encomienda,
  )
  entrega:
    Relation<Entrega>;

}