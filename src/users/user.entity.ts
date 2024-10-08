import { DataTypes } from 'sequelize';
import { AllowNull, Column, Default, Table, Model } from 'sequelize-typescript';

enum SigninMethod {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

@Table({
  timestamps: true, //automatically creates and manages createdAt and updatedAt columns
  paranoid: true, //does not delete trhe
  indexes: [
    //creates index
    { unique: true, fields: ['email'] },
    { fields: ['isActive'] },
    { fields: ['isVerified'] },
    { fields: ['phone'] },
  ],
  scopes: {
    verified: { where: { isVerified: true } },
    active: { where: { isActive: true } },
    withoutPassword: { attributes: { exclude: ['password'] } },
    //we can make number of scopes where we think the same query is being used multiple times
  },
  tableName: 'users',
})
export class User extends Model {
  @Column({
    defaultValue: DataTypes.UUIDV4,
    type: DataTypes.UUID,
    primaryKey: true,
  })
  id: string;

  @AllowNull(false)
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Default(false)
  @Column
  isActive: boolean;

  @Default(false)
  @Column
  isVerified: boolean;

  @AllowNull(true)
  @Column
  email: string;

  @AllowNull(true)
  @Column
  phone: string;

  @AllowNull(true)
  @Column
  password: string;

  @Default(null)
  @Column
  refreshToken: string;

  @Default(SigninMethod.LOCAL)
  @Column({
    type: DataTypes.ENUM(...Object.values(SigninMethod)),
  })
  signinMethod: string;

  @AllowNull(true)
  @Column
  profilePicture: string;
}

export type UserAttributes = Omit<User, 'id' | 'isActive' | 'isVerified'>;
