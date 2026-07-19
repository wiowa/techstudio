import { Entity } from 'typeorm';
import { BaseGameSession } from '../../common/entities/base-game-session.entity';

@Entity('mymotus_sessions')
export class MymotusSession extends BaseGameSession {}
