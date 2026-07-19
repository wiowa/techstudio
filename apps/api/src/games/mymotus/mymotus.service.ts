import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseGameService } from '../common/base-game.service';
import { MymotusSession } from './entities/mymotus-session.entity';

@Injectable()
export class MymotusService extends BaseGameService<MymotusSession> {
  // Jeu de mots (type Motus) : plus de points = meilleure partie, donc le plus
  // grand score gagne.
  protected readonly scoreOrder = 'DESC' as const;

  constructor(
    @InjectRepository(MymotusSession)
    repository: Repository<MymotusSession>
  ) {
    super(repository);
  }
}
