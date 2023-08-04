import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type as validateType } from 'class-transformer';
import { UserRoles } from '@modules/types';

export class UserSignupDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe45',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsEmail()
  public name!: string;
  
  @ApiProperty({
    description: 'The email of the user',
    example: 'example@email.com',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsEmail()
  public email!: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'Daniel',
    required: false,
  })
  @IsOptional()
  @IsString()
  public first_name!: string;

  @ApiProperty({
    description: 'THe last name of the user',
    example: 'Brai',
    required: false,
  })
  @IsOptional()
  @IsString()
  public last_name!: string;

  @ApiProperty({
    description: 'password',
    example: '34535SDF353@#22342',
    required: true,
  })
  @IsDefined()
  @IsString()
  @MinLength(8)
  public password!: string;
}

export class UpdateUserByIdDto {
  @ApiProperty({
    description: 'uuid user_id',
    example: '',
    required: true,
  })
  @IsUUID()
  public id!: string;
}

export class UpdateUserPermissionBodyDto {
  @ApiProperty({
    description: 'uuid user_id',
    example: '',
    enum: UserRoles,
  })
  @IsEnum(UserRoles)
  public permissions!: UserRoles;
}

export class FindUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'example@email.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  public email!: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'DanielBrai',
    required: false,
  })
  @IsOptional()
  @IsString()
  public name!: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'Daniel',
    required: false,
  })
  @IsOptional()
  @IsString()
  public first_name!: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Brai',
    required: false,
  })
  @IsOptional()
  @IsString()
  public last_name!: string;
}

export class BothPassword {
  @IsDefined()
  @IsString()
  old_password: string;

  @IsDefined()
  @IsString()
  new_password: string;
}

export class fieldsToUpdateDto extends PartialType(UserSignupDto) {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @validateType(() => BothPassword)
  public password_update!: BothPassword;

  @ApiProperty({
    description: 'user profile photo url',
    required: false,
  })
  @IsOptional()
  @IsString()
  public profile_photo_url!: string;
}
