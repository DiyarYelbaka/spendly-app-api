import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Kullanıcı email adresi',
  })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Email alanı zorunludur' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Kullanıcı şifresi',
  })
  @IsString()
  @IsNotEmpty({ message: 'Şifre alanı zorunludur' })
  password: string;
}

