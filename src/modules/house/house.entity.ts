import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../user/user.entity';
import { JoinCode } from '../join-code/join-code.entity';

@Entity()
export class House extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.house)
  users: User[];

  @OneToMany(() => JoinCode, (joinCode) => joinCode.house, {
    eager: true,
    nullable: true,
    cascade: true,
  })
  joinCodes: JoinCode[];
}
