import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { RtStrategy } from './strategy/rt.strategy';
import { AtStrategy } from './strategy/at.strategy';
import { OtpService } from './otp.service';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  providers: [AuthService, RtStrategy, AtStrategy, GoogleStrategy, OtpService],
  controllers: [AuthController],
  exports: [AuthService],
  imports: [UsersModule, JwtModule.register({})],
})
export class AuthModule {}
