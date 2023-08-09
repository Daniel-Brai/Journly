import { ApiResponseProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsString, IsObject } from 'class-validator';

export class UserDataDto {
  @ApiResponseProperty({
    example: 'da9b9f51-23b8-4642-97f7-52537b3cf53b',
    format: 'v4',
  })
  public userId: string;

  @ApiResponseProperty({
    example: 'user@email.com',
  })
  @IsDefined()
  @IsEmail()
  public email: string;

  @ApiResponseProperty({
    example: 'admin',
  })
  public permission: string[];
}

export class UserSignInResponseDto {
  @ApiResponseProperty({})
  @IsDefined()
  @IsObject()
  public data: UserDataDto;

  @ApiResponseProperty({
    example: 'euuuuuuuwscdswcscfdes.fwdesfwdwfcews.qwdewefdwefw',
  })
  @IsString()
  public access_token: string;

  @ApiResponseProperty({
    example: 'euuuuuuuwscdswcscfdes.fwdesfwdwfcews.qwdewefdwefw',
  })
  @IsString()
  public refresh_token: string;
}
