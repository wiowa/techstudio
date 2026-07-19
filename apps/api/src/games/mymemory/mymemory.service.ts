import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseGameService } from '../common/base-game.service';
import { MymemorySession } from './entities/mymemory-session.entity';

@Injectable()
export class MymemoryService extends BaseGameService<MymemorySession> {
  // Jeu de mémoire : la meilleure partie est celle avec le moins de coups /
  // le temps le plus court, donc le plus petit score gagne.
  protected readonly scoreOrder = 'ASC' as const;

  constructor(
    @InjectRepository(MymemorySession)
    repository: Repository<MymemorySession>
  ) {
    super(repository);
  }
}
