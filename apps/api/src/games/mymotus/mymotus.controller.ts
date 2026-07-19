import { Controller } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BaseGameController } from '../common/base-game.controller';
import { MymotusSession } from './entities/mymotus-session.entity';
import { MymotusService } from './mymotus.service';

// Limite adaptée au jeu (sauvegardes d'état fréquentes) : elle remplace la
// limite globale très stricte pensée pour les endpoints d'authentification.
@Throttle({ default: { limit: 120, ttl: 60000 } })
@Controller('games/mymotus')
export class MymotusController extends BaseGameController<MymotusSession> {
  constructor(protected readonly service: MymotusService) {
    super();
  }
}
