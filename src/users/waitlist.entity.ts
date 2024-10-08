import { DataTypes } from 'sequelize';
import {
  AllowNull,
  AutoIncrement,
  Column,
  PrimaryKey,
  Table,
  Model,
  Default,
} from 'sequelize-typescript';

enum Status {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

@Table({ timestamps: true, tableName: 'waitlist' })
export class Waitlist extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @AllowNull(false)
  @Column({ unique: true })
  email: string;

  @Default(Status.PENDING)
  @Column({
    type: DataTypes.ENUM(...Object.values(Status)),
  })
  status: string;
}
