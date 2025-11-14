import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Kullanıcı email adresi',
  })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Email alanı zorunludur' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: '6 haneli doğrulama kodu',
    minLength: 6,
    maxLength: 6,
  })
  @IsString({ message: 'Kod string olmalıdır' })
  @IsNotEmpty({ message: 'Kod alanı zorunludur' })
  @Length(6, 6, { message: 'Kod 6 haneli olmalıdır' })
  @Matches(/^\d+$/, { message: 'Kod sadece rakamlardan oluşmalıdır' })
  code: string;
}

