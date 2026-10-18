import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Encomienda } from '../encomienda/encomienda.entity.js';

@Entity({ name: 'personas' })
export class Persona {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 8,
    unique: true,
  })
  dni: string;

  @Column()
  nombres: string;

  @Column()
  apellido_paterno: string;

  @Column()
  apellido_materno: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(
  () => Encomienda,
  (encomienda) =>
    encomienda.remitente,
)
encomiendas_enviadas: Encomienda[];

@OneToMany(
  () => Encomienda,
  (encomienda) =>
    encomienda.destinatario,
)
encomiendas_recibidas: Encomienda[];

}