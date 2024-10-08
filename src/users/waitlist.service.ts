import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Waitlist } from './waitlist.entity';
import { WaitListUserDto } from './dto/createWaitlistuser.dto';

@Injectable()
export class WaitListService {
  constructor(@InjectModel(Waitlist) private waitListModel: typeof Waitlist) {}

  createUser(user: WaitListUserDto) {
    return this.waitListModel.create(user as Partial<Waitlist>);
  }
}
