import {
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { Participants } from '@modules/types';

@Entity('polls')
export class PollEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', length: 500 })
  public topic!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  public topic_image_url!: string;

  @Column({ type: 'jsonb', default: null })
  public participants!: Participants;

  @Column({ type: 'int', default: 1 })
  public votes_per_participant: number;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.polls)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public created_by!: UserEntity;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    select: true,
  })
  public created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    select: true,
  })
  public updated_at!: Date;
}
