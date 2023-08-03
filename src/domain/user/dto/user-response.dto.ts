import { ApiResponseProperty } from '@nestjs/swagger';

export class UserSignupResponseDto {
  @ApiResponseProperty({
    example: 'da9b9f51-23b8-4642-97f7-52537b3cf53b',
    format: 'v4',
  })
  public id: string;

  @ApiResponseProperty({
    example: 'example@email.com',
  })
  public email: string;
}
