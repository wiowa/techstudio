import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseGameSession } from './entities/base-game-session.entity';
import { GameSessionStatus } from './enums/game-session-status.enum';
import { StartSessionDto } from './dto/start-session.dto';
import { SaveStateDto } from './dto/save-state.dto';
import { CompleteSessionDto } from './dto/complete-session.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  bestScore: number;
}

export interface PaginatedSessions<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Logique commune à tous les jeux : cycle de vie d'une partie,
 * sauvegarde d'état, historique et classement.
 *
 * Chaque jeu concret étend ce service, injecte son repository dédié et déclare
 * l'ordre de tri des scores via `scoreOrder` :
 *  - `'DESC'` : le meilleur score est le plus élevé (ex: points).
 *  - `'ASC'`  : le meilleur score est le plus bas (ex: nombre de coups, temps).
 */
export abstract class BaseGameService<T extends BaseGameSession> {
  /** Sens de tri déterminant ce qu'est un « meilleur » score pour ce jeu. */
  protected abstract readonly scoreOrder: 'ASC' | 'DESC';

  constructor(protected readonly repository: Repository<T>) {}

  async startSession(user: User, dto: StartSessionDto): Promise<T> {
    const session = this.repository.create({
      userId: user.id,
      status: GameSessionStatus.IN_PROGRESS,
      difficulty: dto.difficulty,
      state: dto.state,
      metadata: dto.metadata,
    } as DeepPartial<T>);

    return this.repository.save(session);
  }

  /** Récupère la partie en cours la plus récente du joueur, s'il en a une. */
  async getCurrentSession(user: User): Promise<T | null> {
    return this.repository.findOne({
      where: {
        userId: user.id,
        status: GameSessionStatus.IN_PROGRESS,
      } as FindOptionsWhere<T>,
      order: { updatedAt: 'DESC' } as FindOptionsOrder<T>,
    });
  }

  async saveState(user: User, id: string, dto: SaveStateDto): Promise<T> {
    const session = await this.findOwnedSession(user, id);
    this.assertInProgress(session);

    session.state = dto.state;
    if (dto.metadata) {
      session.metadata = { ...(session.metadata ?? {}), ...dto.metadata };
    }

    return this.repository.save(session);
  }

  async completeSession(
    user: User,
    id: string,
    dto: CompleteSessionDto
  ): Promise<T> {
    const session = await this.findOwnedSession(user, id);
    this.assertInProgress(session);

    session.status = GameSessionStatus.COMPLETED;
    session.score = dto.score;
    session.durationMs = dto.durationMs ?? session.durationMs;
    session.completedAt = new Date();
    if (dto.metadata) {
      session.metadata = { ...(session.metadata ?? {}), ...dto.metadata };
    }

    return this.repository.save(session);
  }

  async abandonSession(user: User, id: string): Promise<T> {
    const session = await this.findOwnedSession(user, id);
    this.assertInProgress(session);

    session.status = GameSessionStatus.ABANDONED;
    return this.repository.save(session);
  }

  /** Historique paginé des parties terminées du joueur (plus récentes d'abord). */
  async getHistory(
    user: User,
    query: HistoryQueryDto
  ): Promise<PaginatedSessions<T>> {
    const [items, total] = await this.repository.findAndCount({
      where: {
        userId: user.id,
        status: GameSessionStatus.COMPLETED,
      } as FindOptionsWhere<T>,
      order: { completedAt: 'DESC' } as FindOptionsOrder<T>,
      take: query.limit,
      skip: query.offset,
    });

    return { items, total, limit: query.limit, offset: query.offset };
  }

  /** Meilleure partie terminée du joueur selon `scoreOrder`. */
  async getPersonalBest(user: User): Promise<T | null> {
    return this.repository.findOne({
      where: {
        userId: user.id,
        status: GameSessionStatus.COMPLETED,
      } as FindOptionsWhere<T>,
      order: { score: this.scoreOrder } as FindOptionsOrder<T>,
    });
  }

  /** Classement : meilleur score par joueur, trié selon `scoreOrder`. */
  async getLeaderboard(query: LeaderboardQueryDto): Promise<LeaderboardEntry[]> {
    const aggregate = this.scoreOrder === 'DESC' ? 'MAX' : 'MIN';

    const qb = this.repository
      .createQueryBuilder('s')
      .innerJoin('s.user', 'u')
      .select('u.id', 'userId')
      .addSelect('u.firstName', 'firstName')
      .addSelect('u.lastName', 'lastName')
      .addSelect(`${aggregate}(s.score)`, 'bestScore')
      .where('s.status = :status', { status: GameSessionStatus.COMPLETED })
      .andWhere('s.score IS NOT NULL');

    if (query.difficulty) {
      qb.andWhere('s.difficulty = :difficulty', {
        difficulty: query.difficulty,
      });
    }

    qb.groupBy('u.id')
      .addGroupBy('u.firstName')
      .addGroupBy('u.lastName')
      .orderBy('"bestScore"', this.scoreOrder)
      .limit(query.limit);

    const rows = await qb.getRawMany<{
      userId: string;
      firstName: string | null;
      lastName: string | null;
      bestScore: string;
    }>();

    return rows.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      name:
        [row.firstName, row.lastName].filter(Boolean).join(' ') || 'Anonyme',
      bestScore: Number(row.bestScore),
    }));
  }

  /** Charge une partie en garantissant qu'elle appartient bien au joueur. */
  protected async findOwnedSession(user: User, id: string): Promise<T> {
    const session = await this.repository.findOne({
      where: { id, userId: user.id } as FindOptionsWhere<T>,
    });

    if (!session) {
      throw new NotFoundException(`Game session ${id} not found`);
    }

    return session;
  }

  private assertInProgress(session: T): void {
    if (session.status !== GameSessionStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'This session is already finished and can no longer be updated'
      );
    }
  }
}
