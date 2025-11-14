import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Şifre sıfırlama token (JWT)',
  })
  @IsString({ message: 'Token string olmalıdır' })
  @IsNotEmpty({ message: 'Token alanı zorunludur' })
  token: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Yeni şifre (min 6 karakter, en az 1 küçük harf, 1 büyük harf, 1 rakam)',
    minLength: 6,
  })
  @IsString({ message: 'Şifre string olmalıdır' })
  @IsNotEmpty({ message: 'Şifre alanı zorunludur' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir',
  })
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Şifre tekrarı (newPassword ile eşleşmeli)',
  })
  @IsString({ message: 'Şifre tekrarı string olmalıdır' })
  @IsNotEmpty({ message: 'Şifre tekrarı alanı zorunludur' })
  confirmPassword: string;
}

