import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import {
  AnimalGenderEnum,
  AnimalTypeEnum,
  AnimalStatusEnum,
} from '../../types';
import { House } from '../house/house.entity';

@Entity()
export class Animal extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
}
