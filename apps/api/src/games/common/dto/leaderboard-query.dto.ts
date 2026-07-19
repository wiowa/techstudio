import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class LeaderboardQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 10;

  /** Restreint le classement à une difficulté / variante donnée. */
  @IsString()
  @IsOptional()
  difficulty?: string;
}
