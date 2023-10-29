import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../user/user.entity';
import { JoinCode } from '../join-code/join-code.entity';
import { Animal } from '../animal/animal.entity';

@Entity()
export class House extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.house)
  users: User[];

  @OneToOne(() => JoinCode, { cascade: true })
  @JoinColumn()
  joinCode: JoinCode;

  @OneToMany(() => Animal, (animal) => animal.house, {
    eager: true,
    nullable: true,
  })
  animals: Animal[];
}
