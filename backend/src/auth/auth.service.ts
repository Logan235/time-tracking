import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: any) {
    const user = await this.usersService.createOrUpdate({
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      avatar: googleUser.avatar,
      googleAccessToken: googleUser.googleAccessToken,
      googleRefreshToken: googleUser.googleRefreshToken,
    });
    return user;
  }

  login(user: any) {
    const payload = { email: user.email, sub: user.googleId, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
