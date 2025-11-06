import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Kullanıcı email adresi',
  })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Email alanı zorunludur' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Kullanıcı şifresi (min 6 karakter, en az 1 küçük harf, 1 büyük harf, 1 rakam)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Şifre alanı zorunludur' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir',
  })
  password: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Şifre tekrarı (password ile eşleşmeli)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Şifre tekrarı alanı zorunludur' })
  confirmPassword: string;

  @ApiProperty({
    example: 'Kullanıcı Adı',
    description: 'Kullanıcı adı (2-100 karakter, sadece harfler ve boşluk)',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Ad alanı zorunludur' })
  @MinLength(2, { message: 'Ad en az 2 karakter olmalıdır' })
  @MaxLength(100, { message: 'Ad en fazla 100 karakter olmalıdır' })
  @Matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, {
    message: 'Ad sadece harfler ve boşluk içerebilir',
  })
  name: string;
}

