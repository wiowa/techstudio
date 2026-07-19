import { Entity } from 'typeorm';
import { BaseGameSession } from '../../common/entities/base-game-session.entity';

@Entity('mymemory_sessions')
export class MymemorySession extends BaseGameSession {}
