import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TaskRecurrenceEnum, TaskStatusEnum } from '../../types';
import { User } from '../user/user.entity';
import { Animal } from '../animal/animal.entity';
import { Media } from '../media/media.entity';

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  status: TaskStatusEnum;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  recurrence: TaskRecurrenceEnum;

  @Column()
  date: Date;

  @OneToOne(() => Media, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  picture: Media;

  @ManyToMany(() => User, (user) => user.tasks)
  @JoinTable()
  users?: User[];

  @ManyToMany(() => Animal, (animal) => animal.tasks)
  @JoinTable()
  animals?: Animal[];
}
