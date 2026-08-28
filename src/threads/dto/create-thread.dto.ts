import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from "class-validator";

export class CreateThreadDto {
  @ApiProperty({ example: 'Bagaimana cara belajar NestJS dari nol?' })
  @IsString()
  @MinLength(5)
  title: string;

  @ApiProperty({ example: 'Aku baru mulai belajar backend dan bingung harus mulai dari mana, ada saran?' })
  @IsString()
  @MinLength(10)
  content: string;
}