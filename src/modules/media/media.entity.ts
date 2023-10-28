import { MediaType } from '../../types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity()
export class Media extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ nullable: false, default: '' })
  localPath: string;

  @Column({ nullable: false, default: '' })
  filename: string;

  @Column()
  type: MediaType;

  @Column()
  size: number;
}
