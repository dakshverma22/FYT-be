import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { WaitListService } from './waitlist.service';
import { WaitListUserDto } from './dto/createWaitlistuser.dto';
import { TransformInterceptor } from 'src/auth/common/interceptors/transform.interceptor';

@Controller('user')
@UseInterceptors(TransformInterceptor)
export class UsersController {
  private readonly logger: Logger;
  constructor(private waitListService: WaitListService) {
    this.logger = new Logger(UsersController.name);
  }

  @Get()
  testUsers() {
    this.logger.log('testing');
    return 'running';
  }

  @Post('waitlist')
  async createWaitlistUser(@Body() body: WaitListUserDto) {
    try {
      const waitlistUser = await this.waitListService.createUser(body);
      return {
        data: { userId: waitlistUser.id },
        message: 'User added to waitlist successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to add user to waitlist: ${error}`);
      throw new InternalServerErrorException('Falied to add user to wait list');
    }
  }
}
