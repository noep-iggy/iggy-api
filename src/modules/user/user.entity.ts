import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Media } from '../media/media.entity';
import { UserRoleEnum } from '../../types';
import { BaseEntity } from '../base.entity';
import { House } from '../house/house.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column({ nullable: true })
  email: string;

  @Column({})
  password: string;

  @Column()
  role: UserRoleEnum;

  @OneToOne(() => Media, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  profilePicture: Media;

  @ManyToOne(() => House, (house) => house.users, {
    eager: true,
    nullable: true,
    cascade: true,
  })
  house: House;
}
