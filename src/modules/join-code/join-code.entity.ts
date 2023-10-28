import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { JoincodeTypeEnum } from '../../types';
import { House } from '../house/house.entity';

@Entity()
export class JoinCode extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @ManyToOne(() => House, (house) => house.joinCodes)
  house: House;

  @Column()
  type: JoincodeTypeEnum;
}
