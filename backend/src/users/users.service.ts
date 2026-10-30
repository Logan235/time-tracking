import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async createOrUpdate(profile: {
    googleId: string;
    email: string;
    name: string;
    avatar: string;
    googleAccessToken: string;
    googleRefreshToken?: string;
  }): Promise<User> {
    const update: any = {
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      googleAccessToken: profile.googleAccessToken,
    };
    if (profile.googleRefreshToken) {
      update.googleRefreshToken = profile.googleRefreshToken;
    }

    return this.userModel.findOneAndUpdate(
      { googleId: profile.googleId },
      { $set: update },
      { upsert: true, new: true },
    ).exec();
  }
}
