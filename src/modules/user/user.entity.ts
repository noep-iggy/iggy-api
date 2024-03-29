import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Media } from '../media/media.entity';
import { UserRoleEnum } from '../../types';
import { BaseEntity } from '../base.entity';
import { House } from '../house/house.entity';
import { Task } from '../task/task.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
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
  @JoinColumn()
  house: House;

  @ManyToMany(() => Task, (task) => task.users, {
    nullable: true,
  })
  tasks: Task[];

  @Column({ default: false })
  isAdmin: boolean;
}
