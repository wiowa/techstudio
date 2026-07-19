import { Controller } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BaseGameController } from '../common/base-game.controller';
import { MymemorySession } from './entities/mymemory-session.entity';
import { MymemoryService } from './mymemory.service';

// Limite adaptée au jeu (sauvegardes d'état fréquentes) : elle remplace la
// limite globale très stricte pensée pour les endpoints d'authentification.
@Throttle({ default: { limit: 120, ttl: 60000 } })
@Controller('games/mymemory')
export class MymemoryController extends BaseGameController<MymemorySession> {
  constructor(protected readonly service: MymemoryService) {
    super();
  }
}
