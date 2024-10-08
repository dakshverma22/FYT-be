import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { UsersService } from 'src/users/users.service';
import { promisify } from 'util';
import { OtpService } from './otp.service';
import { AwsService } from 'src/aws/aws.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private awsService: AwsService,
  ) {}

  async signinLocal(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const [existingUser] = await this.usersService.findByidentifier(
      'email',
      email,
    );

    if (!existingUser) {
      throw new NotFoundException('user not found');
    }
    if (!existingUser.isVerified) {
      throw new UnauthorizedException(
        'User is not verified. Please verify your account to signin',
      );
    }

    const [salt, storedHash] = existingUser.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new ForbiddenException('bad password');
    }
    const tokens = await this.generateTokens(
      existingUser.id,
      existingUser.email,
    );

    const hashedrefreshToken = await this.generateHash(tokens.refresh_token);

    await this.usersService.updateUser(existingUser.id, {
      refreshToken: hashedrefreshToken,
    });

    return tokens;
  }

  async signupLocal(
    user: CreateUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    if (user.email) {
      const [existingUser] = await this.usersService.findByidentifier(
        'email',
        user.email,
      );
      if (existingUser) throw new BadRequestException('email in use');
    }
    if (user.phone) {
      const existingUser = await this.usersService.findByidentifier(
        'phone',
        user.phone,
      );
      if (existingUser[0]) throw new BadRequestException('phone in use');
    }

    const hashedPassword = await this.generateHash(user.password);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hashedPassword,
    });
    const { access_token, refresh_token } = await this.generateTokens(
      newUser.id,
      newUser.email,
    );

    const hashedRefreshToken = await this.generateHash(refresh_token);
    const updatedUser = await this.usersService.updateUser(newUser.id, {
      refreshToken: hashedRefreshToken,
    });

    if (!updatedUser) {
      throw new NotFoundException('user not found');
    }
    const otp = this.otpService.generateOtp();
    this.otpService.storeOtp(newUser.id, otp);

    if (user.email) {
      await this.sendOtpViaEmail(newUser.id, otp);
    }

    return { access_token, refresh_token };
  }

  async logoutLocal(id: string) {
    return await this.usersService.updateUser(id, { refreshToken: null });
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findOneById(userId);
    if (!user?.refreshToken) {
      throw new BadRequestException();
    }
    const [storedSalt] = user.refreshToken.split('.');
    const hashedRefreshToken = await this.generateHash(
      refreshToken,
      storedSalt,
    );
    if (hashedRefreshToken !== user.refreshToken) {
      throw new ForbiddenException('access denied');
    }
    const tokens = await this.generateTokens(user.id, user.email);
    const newHashedRefreshToken = await this.generateHash(tokens.refresh_token);
    await this.usersService.updateUser(user.id, {
      refreshToken: newHashedRefreshToken,
    });

    return tokens;
  }

  async generateHash(value: string, storedSalt?: string) {
    const salt = storedSalt || randomBytes(8).toString('hex');

    const hash = (await scrypt(value, salt, 32)) as Buffer;
    return `${salt}.${hash.toString('hex')}`;
  }

  async generateTokens(userId: string, email: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: '15m', secret: 'at-secret' },
        //TODO make the secret in env
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: '7d', secret: 'rt-secret' },
        //TODO make the secret in env
      ),
    ]);

    return { access_token, refresh_token };
  }

  async verifyOtp(userId: string, otp: string) {
    const isValid = this.otpService.verifyOtp(userId, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Otp');
    }
    await this.usersService.updateUser(userId, { isVerified: true });
  }

  async signinGoogle(user) {
    if (!user) {
      throw new BadRequestException('unauthenticated');
    }
    const existingUser = await this.usersService.findByEmail(user.email);

    if (!existingUser) {
      //register user
      //TODO changethe user to have additonal propeerties so that user can be created
      return this.usersService.createUser(user);
    }

    //TODO generate token for the new User
    const tokens = this.generateTokens(user.id, user.email);
    return tokens;
  }

  async registerUserGoogle(user: CreateUserDto) {
    const newUser = await this.usersService.createUser(user);
    //TODO make this first and last name from the email
    newUser.firstName = 'test fn';
    newUser.lastName = 'test ln';

    return this.generateTokens(newUser.id, newUser.email);
  }

  // Implement sendOtpViaEmail and sendOtpViaSms methods
  private async sendOtpViaEmail(email: string, otp: string) {
    await this.awsService.sendEmail(email, 'OTP', otp);
    // Implement email sending logic
  }

  private async sendOtpViaSms(phone: string, otp: string) {
    await this.awsService.sendSms(phone, otp);
    // Implement SMS sending logic
  }

  async validateGoogleUser(details: any) {
    const user = await this.usersService.findByEmail(details.email);
    if (user) return user;
    this.signupLocal;
    return this.usersService.createUser({
      email: details.email,
      firstName: details.firstName,
      lastName: details.lastName,
      // password: '',
      // picture: details.picture,
    });
  }
}
