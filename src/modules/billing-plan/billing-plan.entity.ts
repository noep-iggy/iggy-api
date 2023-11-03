import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { House } from '../house/house.entity';
import { BillingPlanTypeEnum } from '../../types';

@Entity()
export class BillingPlan extends BaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @OneToMany(() => House, (house) => house.billingPlan, {
    nullable: true,
  })
  @JoinColumn()
  houses: House[];

  @Column()
  type: BillingPlanTypeEnum;
}
