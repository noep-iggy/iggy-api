import { AnimalTypeEnum } from '@/types';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Media } from '../media/media.entity';

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

  @OneToOne(() => Media, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  image?: Media;

  @Column()
  brand: string;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  discountPrice: number;
}
