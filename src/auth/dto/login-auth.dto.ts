import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class LoginAuthDto {

@ApiProperty({
    example: 'cliente@mandaya.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Cliente123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

}