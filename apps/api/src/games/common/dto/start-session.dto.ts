import { IsObject, IsOptional, IsString } from 'class-validator';

export class StartSessionDto {
  @IsString()
  @IsOptional()
  difficulty?: string;

  /** État initial optionnel (permet de démarrer une partie déjà pré-remplie). */
  @IsObject()
  @IsOptional()
  state?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
