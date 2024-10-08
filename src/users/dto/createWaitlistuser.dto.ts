import { IsEmail } from 'class-validator';

export class WaitListUserDto {
  @IsEmail()
  email: string;
}
