import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { Response } from 'express';
import { RefreshTokenGuard } from './common/guards/accessToken.guard';
import { AccessTokenGuard } from './common/guards/refreshToken.guard';
import { CurrentUser } from './common/decorators/currentUser.decorator';
import { setAuthCookies } from './common/utils/cookie.utils';
import { VerifiedUserGuard } from 'src/users/guards/user-verified-guard';
import { GoogleOAuthGuard } from './guards/googleOAuth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger: Logger;
  constructor(private authService: AuthService) {
    this.logger = new Logger(AuthController.name);
  }

  @HttpCode(HttpStatus.OK)
  @Post('local/signin')
  async signinLocal(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signinLocal(
      body.email,
      body.password,
    );
    if (!(tokens.access_token && tokens.refresh_token)) {
      throw new HttpException('User login failed', HttpStatus.BAD_REQUEST);
    }

    //set cookies
    setAuthCookies(res, tokens);
    return { message: 'sigin successfull' };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('local/signup')
  async signupLocal(
    @Body() body: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signupLocal(body);
    if (!(tokens.access_token && tokens.refresh_token)) {
      throw new HttpException('User creation failed', HttpStatus.BAD_REQUEST);
    }
    //set cookies
    setAuthCookies(res, tokens);

    return { message: 'signup successfull' };
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('local/logout')
  async logout(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutLocal(userId);
    // clear cookies
    setAuthCookies(res, null, true);
    return { message: 'signout successfull' };
  }

  @UseGuards(RefreshTokenGuard, VerifiedUserGuard)
  @HttpCode(HttpStatus.OK)
  @Post('local/refresh')
  refreshTokens(
    @CurrentUser() user: { sub: string; email: string; refreshToken: string },
  ) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  @Post('verify-otp')
  async verifyotp(@Body() body: { userId: string; otp: string }) {
    await this.authService.verifyOtp(body.userId, body.otp);
    return { message: 'OTP verified successfully' };
  }

  @UseGuards(GoogleOAuthGuard)
  @Get('google')
  async google(@Req() req) {}

  @UseGuards(GoogleOAuthGuard)
  @Get('google/callback')
  async googleAuthCallback(
    @CurrentUser() user: any,
    //TODO change the type of the user
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signinGoogle(user);

    //set cookies
    setAuthCookies(
      res,
      tokens as { access_token: string; refresh_token: string },
    );

    return { message: 'google signin successfull' };
  }

  //TODO to check if this needs to exists or the above one
  // @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  // googleAuthRedirect(@Req() req) {
  //   return this.authService.login(req.user);
  // }
}
