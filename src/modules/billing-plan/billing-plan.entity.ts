import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { BillingPlanTypeEnum } from '../../types';
import { BaseEntity } from '../base.entity';
import { House } from '../house/house.entity';

@Entity()
export class BillingPlan extends BaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'float',
  })
  price: number;

  @OneToMany(() => House, (house) => house.billingPlan, {
    nullable: true,
  })
  @JoinColumn()
  houses: House[];

  @Column()
  type: BillingPlanTypeEnum;
}
