import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TaskStatusEnum } from '../../types';
import { User } from '../user/user.entity';
import { Animal } from '../animal/animal.entity';
import { Media } from '../media/media.entity';
import { Recurrence } from '../recurrence/recurrence.entity';

@Entity()
export class Task extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  status: TaskStatusEnum;

  @Column({ nullable: true })
  message: string;

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

  @OneToOne(() => Recurrence, (reccurence) => reccurence.task, {
    nullable: true,
  })
  @JoinColumn()
  recurrence?: Recurrence;

  @Column({ default: false })
  isArchived: boolean;
}
