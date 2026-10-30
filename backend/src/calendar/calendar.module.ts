import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service.js';
import { CalendarController } from './calendar.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { EventMappingsModule } from '../event-mappings/event-mappings.module.js';
import { GroupsModule } from '../groups/groups.module.js';

@Module({
  imports: [AuthModule, UsersModule, EventMappingsModule, GroupsModule],
  controllers: [CalendarController],
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class CalendarModule {}