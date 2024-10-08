import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { WaitListService } from './waitlist.service';
import { Waitlist } from './waitlist.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService, WaitListService],
  imports: [SequelizeModule.forFeature([User, Waitlist])],
  exports: [UsersService],
})
export class UsersModule {}
