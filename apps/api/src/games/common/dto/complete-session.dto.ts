import { IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class CompleteSessionDto {
  @IsInt()
  @Min(0)
  score!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationMs?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
