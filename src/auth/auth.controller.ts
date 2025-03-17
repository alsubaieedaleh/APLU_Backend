import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register a new user
  @Post('register')
  async register(
    @Body() registerDto: { email: string; password: string; fullName: string; role: string },
  ) {
    return this.authService.register(registerDto);
  }

  // Login with email and password
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto);
  }

  // Get current authenticated user's profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user);
  }

  // Logout endpoint
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user);
  }

  // Refresh JWT token endpoint
  @Post('refresh-token')
  async refreshToken(@Body() refreshDto: { refreshToken: string }) {
    return this.authService.refreshToken(refreshDto);
  }

  // OAuth login endpoint (supports Google, Facebook, Apple, etc.)
  @Post('oauth')
  async oauthLogin(@Body() oauthDto: any) {
    return this.authService.googleLogin(oauthDto);
  }
}
