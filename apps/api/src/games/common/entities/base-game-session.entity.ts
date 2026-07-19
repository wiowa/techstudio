import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { GameSessionStatus } from '../enums/game-session-status.enum';

/**
 * Base commune à toutes les parties de jeu.
 *
 * Chaque jeu concret étend cette classe abstraite et déclare son propre
 * `@Entity('..._sessions')` : TypeORM crée alors une table dédiée par jeu
 * (concrete table inheritance) tout en partageant la structure et la logique.
 *
 * Une même ligne couvre les trois besoins :
 *  - sauvegarde d'état : `status = IN_PROGRESS` + `state` sérialisé
 *  - historique        : `status = COMPLETED`
 *  - leaderboard       : agrégation des `score` des parties terminées
 */
export abstract class BaseGameSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @Column({
    type: 'enum',
    enum: GameSessionStatus,
    default: GameSessionStatus.IN_PROGRESS,
  })
  status!: GameSessionStatus;

  /** Score final de la partie (rempli à la complétion). */
  @Column({ type: 'int', nullable: true })
  score?: number;

  /** Durée de la partie en millisecondes. */
  @Column({ type: 'int', nullable: true })
  durationMs?: number;

  /** Difficulté / variante jouée (ex: '4x4', 'easy'). */
  @Column({ nullable: true })
  difficulty?: string;

  /** État sérialisé de la partie en cours, permettant de la reprendre. */
  @Column({ type: 'jsonb', nullable: true })
  state?: Record<string, unknown>;

  /** Métadonnées libres propres au jeu. */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
