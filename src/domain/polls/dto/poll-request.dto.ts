import { ApiProperty } from '@nestjs/swagger';
import {
  Length,
  IsDefined,
  IsInt,
  IsString,
  IsUUID,
  IsOptional,
  Min,
} from 'class-validator';

export class CreatePollDto {
  @ApiProperty({
    description: 'The topic of the poll',
    required: true,
  })
  @Length(1, 500)
  @IsString()
  @IsDefined()
  public readonly topic: string;

  @ApiProperty({
    description: 'The topic image url of the poll',
    required: false,
  })
  @IsOptional()
  @IsString()
  public topic_image_url!: string;

  @ApiProperty({
    description: 'The number of votes per participant in a poll',
    example: '1',
    required: false,
  })
  @IsOptional()
  @Min(1)
  @IsInt()
  public votes_per_paricipant!: number;
}

export class JoinPollDto {
  @ApiProperty({
    description: 'The id of the poll (uuid)',
    required: true,
  })
  @IsUUID()
  @IsDefined()
  public readonly id: string;

  @ApiProperty({
    description: 'The id of the poll participant (uuid)',
    required: true,
  })
  @IsUUID()
  @IsDefined()
  public readonly participant_id: string;
}

export class RejoinPollDto {
  @ApiProperty({
    description: 'The id of the poll (uuid)',
    required: true,
  })
  @IsUUID()
  @IsDefined()
  public readonly id: string;

  @ApiProperty({
    description: 'The creator of the poll user id (uuid)',
    required: true,
  })
  @IsUUID()
  @IsDefined()
  public readonly created_by: string;

  @ApiProperty({
    description: 'The username of the poll participant',
    required: true,
  })
  @Length(1, 500)
  @IsString()
  @IsDefined()
  public readonly participant_name: string;
}
