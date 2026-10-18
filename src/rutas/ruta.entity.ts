import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  RutaSede,
} from './ruta-sede.entity.js';

import {
  Traslado,
} from '../traslados/traslado.entity.js';

@Entity({
  name: 'rutas',
})
export class Ruta {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  name: string;

  @Column({
    default: true,
  })
  active: boolean;

  @OneToMany(
    () => RutaSede,
    (rutaSede) =>
      rutaSede.ruta,
  )
  sedes: RutaSede[];

  @OneToMany(
    () => Traslado,
    (traslado) =>
      traslado.ruta,
  )
  traslados: Traslado[];

}