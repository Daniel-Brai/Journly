import { Length, IsDefined, IsString } from 'class-validator';

export class CreatePollDto {
  @Length(1, 255)
  @IsString()
  @IsDefined()
  public readonly topic: string;
}

export class JoinPollDto {
  @IsString()
  @IsDefined()
  public readonly id: string;

  @Length(1, 255)
  @IsString()
  @IsDefined()
  public readonly participant_name: string;
}

export class RejoinPollDto {
  @IsString()
  @IsDefined()
  public readonly id: string;

  @IsString()
  @IsDefined()
  public readonly created_by: string;

  @Length(1, 255)
  @IsString()
  @IsDefined()
  public readonly participant_name: string;
}
