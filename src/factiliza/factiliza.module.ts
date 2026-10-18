import {
  Module,
} from '@nestjs/common';

import {
  FactilizaService,
} from './factiliza.service.js';

@Module({
  providers: [
    FactilizaService,
  ],

  exports: [
    FactilizaService,
  ],
})
export class FactilizaModule {}