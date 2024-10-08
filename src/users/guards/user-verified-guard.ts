import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersService } from '../users.service';

export class VerifiedUserGuard implements CanActivate {
  constructor(private userService: UsersService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // const user = request.user; // Assuming you have authentication middleware that adds the user to the request
    const isUserVerified = (await this.userService.findOneById(request.user.id))
      .isVerified;
    return isUserVerified;
  }
}
