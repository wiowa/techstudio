import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MymotusSession } from './entities/mymotus-session.entity';
import { MymotusService } from './mymotus.service';
import { MymotusController } from './mymotus.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MymotusSession])],
  controllers: [MymotusController],
  providers: [MymotusService],
})
export class MymotusModule {}
