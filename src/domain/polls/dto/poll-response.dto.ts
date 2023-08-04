import { ApiResponseProperty } from '@nestjs/swagger';

export class CreatedPollResponseDto {
  @ApiResponseProperty({
    example: 'da9b9f51-23b8-4642-97f7-52537b3cf53b',
    format: 'v4',
  })
  public id: string;

  @ApiResponseProperty({
    example: 'Who should tip for our next outing?',
  })
  public topic: string;

  @ApiResponseProperty({
    example: 'https://cdn.cloudinary.com/dog-da9b9f51-23b8-4642-97f7-52537b3cf53b.jpg',
  })
  public topic_image_url: string;

  @ApiResponseProperty({
    example: '5',
  })
  public votes_per_participant: number;

  @ApiResponseProperty({})
  public participants: any;

  @ApiResponseProperty({
    example: 'da9b9f51-23b8-4642-97f7-52537b3cf53b',
    format: 'v4',
  })
  public created_by: string;
}

export class GenericPollMessageResponseDto {
  @ApiResponseProperty({ 
    example: "@Jeremy123 joined your poll"
  })
  public message: string;
}

