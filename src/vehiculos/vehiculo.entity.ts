import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Traslado } from '../traslados/traslado.entity.js';

@Entity({
  name: 'vehiculos',
})
export class Vehiculo {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  placa: string;

  @Column()
  descripcion: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  capacidad_kg: number;

  @Column({
    default: true,
  })
  active: boolean;

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
    () => Traslado,
    (traslado) => traslado.vehiculo,
  )
  traslados: Traslado[];

}