import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, IsEmail } from 'class-validator';

export class UserSignInDto {
  @ApiProperty({
    description: "This is the user's email",
    example: 'user@email.com',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsEmail()
  public email!: string;

  @ApiProperty({
    description: "This is the user's password",
    example: 'Jaq656$590)l',
    required: true,
  })
  @IsDefined()
  @IsString()
  public password!: string;
}
