import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';
import { UserAttributes } from '../user.entity';

export class CreateUserDto implements Partial<UserAttributes> {
  @IsString()
  firstName: string;

  @IsString()
  lastName?: string;

  @ValidateIf((o) => !o.phone)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsPhoneNumber()
  phone?: string;

  @IsStrongPassword()
  password: string;
}
