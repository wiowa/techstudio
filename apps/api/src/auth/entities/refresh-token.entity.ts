import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  token!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ default: false })
  isRevoked!: boolean;

  @Column({ nullable: true })
  replacedByToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @Column()
  createdByIp!: string;

  @Column({ nullable: true })
  revokedByIp?: string;

  @CreateDateColumn()
  createdAt!: Date;

  // Helper methods
  get isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  get isActive(): boolean {
    return !this.isRevoked && !this.isExpired;
  }
}
