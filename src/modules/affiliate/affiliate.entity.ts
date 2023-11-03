import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { AnimalTypeEnum } from '@/types';

@Entity()
export class Affiliate extends BaseEntity {
  @Column()
  url: string;

  @Column('simple-array', {
    nullable: false,
  })
  animals: AnimalTypeEnum[];

  @Column({
    nullable: true,
  })
  description?: string;

  @Column()
  title: string;

  @Column()
  code: string;
}
