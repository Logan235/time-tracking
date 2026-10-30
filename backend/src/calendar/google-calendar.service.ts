import { Injectable, UnauthorizedException } from '@nestjs/common';
import { google, calendar_v3, Auth } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema.js';

@Injectable()
export class GoogleCalendarService {
  private oauth2Client: Auth.OAuth2Client;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_CALLBACK_URL'),
    );
  }

  /**
   * Initialize the OAuth2 client with user's tokens
   * Automatically handles token refresh if access token is expired
   */
  async initializeClient(userId: string): Promise<calendar_v3.Calendar> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    // Set up automatic token refresh
    this.oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await this.updateUserTokens(userId, tokens.access_token, tokens.refresh_token || undefined);
      }
    });

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Update user's tokens in database when refreshed
   */
  private async updateUserTokens(
    userId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    const update: any = { googleAccessToken: accessToken };
    if (refreshToken) {
      update.googleRefreshToken = refreshToken;
    }
    await this.userModel.findByIdAndUpdate(userId, { $set: update }).exec();
  }

  /**
   * Fetch events from Google Calendar for the specified date range
   * Default: 7 days ago to 7 days from now
   */
  async fetchEvents(
    userId: string,
    options?: { days?: number },
  ): Promise<calendar_v3.Schema$Event[]> {
    const calendar = await this.initializeClient(userId);
    const days = options?.days || 7;
    const now = new Date();
    
    // timeMin: 7 days ago from now
    const timeMin = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    // timeMax: 7 days from now
    const timeMax = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500,
    });

    return response.data.items || [];
  }
}