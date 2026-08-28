import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  
  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing){
      throw new BadRequestException('Email sudah terdaftar');
    }
    const password_hash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password_hash,
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if(!user) {
      throw new UnauthorizedException('Email atau password salah!');
    }
    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau password salah!')
    }
    const acces_token = this.jwtService.sign({ userId: user.id });
    return { acces_token };
  }
}