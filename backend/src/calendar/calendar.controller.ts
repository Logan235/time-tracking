import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleCalendarService } from './google-calendar.service.js';
import { EventMappingsService } from '../event-mappings/event-mappings.service.js';
import { GroupsService } from '../groups/groups.service.js';

@Controller('calendar')
@UseGuards(AuthGuard('jwt'))
export class CalendarController {
  constructor(
    private googleCalendarService: GoogleCalendarService,
    private eventMappingsService: EventMappingsService,
    private groupsService: GroupsService,
  ) {}

  @Get('events')
  async getEvents(
    @Req() req: any,
    @Query('days') days?: number,
  ) {
    const userId = req.user._id.toString();
    
    // 1. Fetch events from Google Calendar
    const googleEvents = await this.googleCalendarService.fetchEvents(userId, { days });
    
    // 2. Fetch all mappings for this user
    const mappings = await this.eventMappingsService.findAll(userId);
    
    // 3. Fetch all groups for this user
    const groups = await this.groupsService.findAll(userId);
    
    // Create lookup maps for efficient merging
    const mappingMap = new Map(mappings.map(m => [m.eventId, { 
      groupId: m.groupId.toString(),
      isMultiDay: m.isMultiDay,
      hoursPerDay: m.hoursPerDay,
      timeOfDay: m.timeOfDay,
    }]));
    const groupMap = new Map(groups.map(g => [g._id.toString(), { name: g.name, color: g.color }]));
    
    // 4. Merge: attach group info to each event
    const mergedEvents = googleEvents.map(event => {
      const eventId = event.id || '';
      const mapping = eventId ? mappingMap.get(eventId) : undefined;
      const groupId = mapping?.groupId;
      const groupDetail = groupId ? groupMap.get(groupId) : null;
      
      return {
        ...event,
        groupId: groupId || null,
        group: groupDetail || null,
        isMultiDay: mapping?.isMultiDay || false,
        hoursPerDay: mapping?.hoursPerDay || 2,
        timeOfDay: mapping?.timeOfDay || 'flexible',
      };
    });
    
    return { events: mergedEvents };
  }
}