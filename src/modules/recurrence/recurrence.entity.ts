import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TaskRecurrenceEnum } from '../../types';
import { Task } from '../task/task.entity';

@Entity()
export class Recurrence extends BaseEntity {
  @Column()
  date: Date;

  @Column()
  type: TaskRecurrenceEnum;

  @OneToOne(() => Task, (task) => task.recurrence, {
    nullable: true,
  })
  task: Task;
}
