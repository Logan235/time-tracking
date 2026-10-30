import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super_secret',
    });
  }

  async validate(payload: any) {
    let user = null;
    const sub = payload.sub;

    if (sub) {
      // Try finding by googleId first
      user = await this.usersService.findByGoogleId(sub);
      
      // If not found and sub is a valid MongoDB ObjectId, try finding by _id
      if (!user && Types.ObjectId.isValid(sub)) {
        user = await this.userModel.findById(sub).exec();
      }
    }

    if (!user) {
      throw new UnauthorizedException('User not found or invalid token');
    }
    return user;
  }
}