import { Body, Controller, Get, Post, UseGuards,Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthGuard } from "../common/guards/auth.guard";


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto){
    return this.authService.login(dto)
  }
  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req) {
    return req.user;
  }

} 
