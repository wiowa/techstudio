import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class SaveStateDto {
  /** État sérialisé de la partie à sauvegarder. */
  @IsObject()
  @IsNotEmpty()
  state!: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
