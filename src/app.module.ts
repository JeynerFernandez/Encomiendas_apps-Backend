import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesModule } from './roles/roles.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SedesModule } from './sedes/sedes.module.js';
import { PersonasModule } from './personas/personas.module.js';
import { RutasModule } from './rutas/rutas.module.js';
import { TarifasModule } from './tarifas/tarifas.module.js';
import { VehiculosModule } from './vehiculos/vehiculos.module.js';
import { TrasladosModule } from './traslados/traslados.module.js';
import { EncomiendaModule } from './encomienda/encomienda.module.js';
import { TrasladoEncomiendaModule } from './traslado-encomienda/traslado-encomienda.module.js';
import { HistorialEncomiendaModule } from './historial-encomienda/historial-encomienda.module.js';
import { PagosModule } from './pagos/pagos.module.js';
import { EntregasModule } from './entregas/entregas.module.js';
import { TiposIncidenciaModule } from './tipos-incidencia/tipos-incidencia.module.js';
import { IncidenciasModule } from './incidencias/incidencias.module.js';
import { UbicacionTrasladoModule } from './ubicacion-traslado/ubicacion-traslado.module.js';
import { ReportesModule } from './reportes/reportes.module.js';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'Credenciales.env',
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'jeyner',
      database: 'manda_ya',

      entities: [
        import.meta.dirname +
        '/**/*.entity{.ts,.js}',
      ],

      synchronize: true,
    }),

    RolesModule,
    UsersModule,
    AuthModule,
    SedesModule,
    PersonasModule,
    RutasModule,
    TarifasModule,
    VehiculosModule,
    TrasladosModule,
    EncomiendaModule,
    TrasladoEncomiendaModule,
    HistorialEncomiendaModule,
    PagosModule,
    EntregasModule,
    TiposIncidenciaModule,
    IncidenciasModule,
    UbicacionTrasladoModule,
    ReportesModule,

  ],
})
export class AppModule {}