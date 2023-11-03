import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../user/user.entity';
import { JoinCode } from '../join-code/join-code.entity';
import { Animal } from '../animal/animal.entity';
import { BillingPlan } from '../billing-plan/billing-plan.entity';

@Entity()
export class House extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.house)
  @JoinColumn()
  users: User[];

  @OneToOne(() => JoinCode, { cascade: true })
  @JoinColumn()
  joinCode: JoinCode;

  @OneToMany(() => Animal, (animal) => animal.house, {
    nullable: true,
  })
  @JoinColumn()
  animals: Animal[];

  @ManyToOne(() => BillingPlan, (billingPlan) => billingPlan.houses, {
    nullable: true,
  })
  @JoinColumn()
  billingPlan: BillingPlan;
}
