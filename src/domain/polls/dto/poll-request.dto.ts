import { ApiProperty } from '@nestjs/swagger';
import {
  Length,
  IsArray,
  IsDefined,
  IsEmail,
  IsInt,
  IsObject,
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

  @ApiProperty({
    description: 'The signature of the poll',
    required: true,
  })
  @Length(1, 500)
  @IsString()
  @IsOptional()
  public readonly signature: string;
}

export class JoinPollDto {
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

export class LeavePollDto {
  @ApiProperty({
    description: 'The id of the poll participant (uuid)',
    required: true,
  })
  @IsUUID()
  @IsDefined()
  public readonly participant_id!: string;
}

export class InviteToPollDto {
  @ApiProperty({
    description: 'The username of the user you want to invite',
    example: 'johndoggle235',
    required: false,
  })
  @IsString()
  @IsOptional()
  public username!: string;

  @ApiProperty({
    description: 'The email of the user you want to invite',
    example: 'example@email.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  public email!: string;
}

export class AddNominationDto {
  @ApiProperty({
    description: 'The id of the poll participant (uuid)',
    required: true,
  })
  @IsUUID()
  @IsDefined()
  public participant_id!: string;

  @ApiProperty({
    description: 'The description of the nomination chosen by the participant',
    required: true,
  })
  @Length(1, 100)
  @IsString()
  @IsDefined()
  public description!: string;
}

export class RemoveNominationDto {
  @ApiProperty({
    description: 'The id of the nomination (uuid)',
    required: true,
  })
  @IsUUID()
  @IsDefined()
  public nomination_id!: string;
}

export class AddNominationDataDto {
  @ApiProperty({
    description: 'The shape of the nomination object',
    required: true,
  })
  @IsObject()
  @IsDefined()
  public nomination!: AddNominationDto;
}

export class AddRankingsDataDto {
  @ApiProperty({
    description: 'The id of the poll participant (uuid)',
    required: true,
  })
  @IsUUID()
  @IsDefined()
  public participant_id!: string;

  @ApiProperty({
    description: 'The rankings made by a participant',
    required: true,
  })
  @IsArray()
  @IsDefined()
  public rankings!: string[];
}

export class ResultDataDto {
  @ApiProperty({ 
    description: 'The id of the nomination (uuid)',
    required: true,
  })
  @IsString()
  @IsDefined()
  nomination_id: string;
  
  @ApiProperty({ 
    description: 'The description or text of the nomination',
    required: true,
  })
  @IsString()
  @IsDefined()
  nomination_description: string;
  
  @ApiProperty({ 
    description: 'The score of the nomination',
    required: true,
  })
  @Min(1)
  @IsInt()
  @IsDefined()
  score: number;
}

export class AddResultsDto {
  @ApiProperty({ description: 'The array of Results', required: true })
  @IsArray()
  @IsDefined()
  public results!: ResultDataDto[];
}
