import {
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";


@Entity('polls')
export class PollEntity extends BaseEntity { 
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: "varchar", length: 255, select: true, unique: true })
  public topic!: string;

  @Column({ type: "varchar", length: 500 })
  public password!: string;
  
  @CreateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    select: true,
  })
  public created_at!: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    select: true,
  })
  public updated_at!: Date;

}
