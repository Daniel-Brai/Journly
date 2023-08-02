import { Length, IsDefined, IsInt, IsString, Min } from 'class-validator';

export class CreatePollDto {
  @Length(1, 255)
  @IsString()
  @IsDefined()
  public readonly poll_topic: string;

  @Min(1)
  @IsInt()
  @IsDefined()
  public readonly votes_per_participant: number;

  @Length(1, 255)
  @IsString()
  @IsDefined()
  public readonly participant_name: string;
}

export class JoinPollDto {
  @IsString()
  @IsDefined()
  public readonly poll_id: string;

  @Length(1, 255)
  @IsString()
  @IsDefined()
  public readonly participant_name: string;
}

export class RejoinPollDto {
  @IsString()
  @IsDefined()
  public readonly poll_id: string;

  @Min(1)
  @IsInt()
  @IsDefined()
  public readonly user_id: string;

  @Length(1, 255)
  @IsString()
  @IsDefined()
  public readonly participant_name: string;
}
