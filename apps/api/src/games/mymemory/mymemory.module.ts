import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MymemorySession } from './entities/mymemory-session.entity';
import { MymemoryService } from './mymemory.service';
import { MymemoryController } from './mymemory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MymemorySession])],
  controllers: [MymemoryController],
  providers: [MymemoryService],
})
export class MymemoryModule {}
