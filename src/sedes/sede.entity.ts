import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RutaSede } from '../rutas/ruta-sede.entity.js';
import { Tarifa } from '../tarifas/tarifa.entity.js';
import { Encomienda } from '../encomienda/encomienda.entity.js';
import { HistorialEncomienda } from '../historial-encomienda/historial-encomienda.entity.js';

@Entity({
  name: 'sedes',
})
export class Sede {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  name: string;

  @Column()
  city: string;

  @Column()
  address: string;

  @Column({
    type: 'double',
  })
  latitude: number;

  @Column({
    type: 'double',
  })
  longitude: number;

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
    () => RutaSede,
    (rutaSede) => rutaSede.sede,
  )
  rutas: RutaSede[];

  @OneToMany(
    () => Tarifa,
    (tarifa) => tarifa.origen,
  )
  tarifas_origen: Tarifa[];

  @OneToMany(
    () => Tarifa,
    (tarifa) => tarifa.destino,
  )
  tarifas_destino: Tarifa[];
@OneToMany(
  () => Encomienda,
  (encomienda) =>
    encomienda.sede_origen,
)
encomiendas_origen: Encomienda[];

@OneToMany(
  () => Encomienda,
  (encomienda) =>
    encomienda.sede_destino,
)
encomiendas_destino: Encomienda[];

@OneToMany(
  () => Encomienda,
  (encomienda) =>
    encomienda.ultima_sede,
)
encomiendas_actuales: Encomienda[];

@OneToMany(
  () => HistorialEncomienda,
  (historial) =>
    historial.sede,
)
historial_encomiendas:
  HistorialEncomienda[];
}