import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'refresh_token_string',
    description: 'Refresh token',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token alanı zorunludur' })
  refreshToken: string;
}

