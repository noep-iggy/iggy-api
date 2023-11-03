import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { JoinCodeTypeEnum } from '../../types';
import { House } from '../house/house.entity';

@Entity()
export class JoinCode extends BaseEntity {
  @Column()
  code: string;

  @Column()
  expirationDate: Date;

  @Column()
  type: JoinCodeTypeEnum;

  @OneToOne(() => House, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  house: House;
}
