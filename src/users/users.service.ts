import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  createUser(user: Partial<CreateUserDto>) {
    return this.userModel.create(user as Partial<User>);
  }

  findOneById(id: string) {
    return this.userModel.findOne({ where: { id } });
  }

  findByPhone(phone: string) {
    return this.userModel.findAll({ where: { phone } });
  }

  findByEmail(email: string) {
    return this.userModel.findAll({ where: { ['email']: email } });
  }

  async findByidentifier(identifier: 'email' | 'phone', value: string) {
    return await this.userModel.findAll({
      where: { [identifier]: value },
    });
  }

  findAll() {
    return this.userModel.findAll();
  }

  async removeById(id: string) {
    const user = await this.findOneById(id);
    await user.destroy();
    return user;
  }

  async updateUser(id: string, updatedData: Partial<User>) {
    const [updatedRowsCount, [updatedUser]] = await this.userModel.update(
      updatedData,
      { where: { id }, returning: true },
    );
    if (updatedRowsCount === 0) {
      return null;
    }
    return updatedUser;
  }
}
