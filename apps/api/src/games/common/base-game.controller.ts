import {
  Body,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { BaseGameSession } from './entities/base-game-session.entity';
import { BaseGameService } from './base-game.service';
import { StartSessionDto } from './dto/start-session.dto';
import { SaveStateDto } from './dto/save-state.dto';
import { CompleteSessionDto } from './dto/complete-session.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

/**
 * Routes communes exposées par chaque jeu.
 *
 * Chaque contrôleur concret hérite de cette classe et fournit son préfixe via
 * `@Controller('games/<jeu>')` ainsi que le service concret injecté. NestJS
 * enregistre les routes déclarées ici sur le contrôleur enfant.
 */
export abstract class BaseGameController<T extends BaseGameSession> {
  protected abstract readonly service: BaseGameService<T>;

  /** Démarre une nouvelle partie. */
  @Post('sessions')
  start(@CurrentUser() user: User, @Body() dto: StartSessionDto) {
    return this.service.startSession(user, dto);
  }

  /** Reprend la partie en cours du joueur (null s'il n'y en a pas). */
  @Get('sessions/current')
  current(@CurrentUser() user: User) {
    return this.service.getCurrentSession(user);
  }

  /** Sauvegarde l'état d'une partie en cours. */
  @Put('sessions/:id/state')
  saveState(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveStateDto
  ) {
    return this.service.saveState(user, id, dto);
  }

  /** Termine une partie et enregistre son score. */
  @Post('sessions/:id/complete')
  complete(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteSessionDto
  ) {
    return this.service.completeSession(user, id, dto);
  }

  /** Abandonne une partie en cours. */
  @Post('sessions/:id/abandon')
  abandon(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.service.abandonSession(user, id);
  }

  /** Historique paginé des parties terminées du joueur. */
  @Get('history')
  history(@CurrentUser() user: User, @Query() query: HistoryQueryDto) {
    return this.service.getHistory(user, query);
  }

  /** Classement des meilleurs scores. */
  @Get('leaderboard')
  leaderboard(@Query() query: LeaderboardQueryDto) {
    return this.service.getLeaderboard(query);
  }

  /** Meilleure partie personnelle du joueur. */
  @Get('best')
  best(@CurrentUser() user: User) {
    return this.service.getPersonalBest(user);
  }
}
