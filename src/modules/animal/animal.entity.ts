import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import {
  AnimalGenderEnum,
  AnimalTypeEnum,
  AnimalStatusEnum,
} from '../../types';
import { House } from '../house/house.entity';
import { Task } from '../task/task.entity';

@Entity()
export class Animal extends BaseEntity {
  @Column()
  name: string;

  @Column()
  bornDate: Date;

  @Column()
  gender: AnimalGenderEnum;

  @Column()
  type: AnimalTypeEnum;

  @Column()
  status: AnimalStatusEnum;

  @ManyToOne(() => House, (house) => house.animals, {
    nullable: true,
  })
  house: House;

  @ManyToMany(() => Animal, (animal) => animal.tasks, {
    nullable: true,
  })
  tasks: Task[];
}
