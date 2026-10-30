import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventMappingsService } from './event-mappings.service.js';

@Controller('mappings')
@UseGuards(AuthGuard('jwt'))
export class EventMappingsController {
  constructor(private mappingsService: EventMappingsService) {}

  @Post()
  async assign(
    @Req() req: any, 
    @Body() body: { eventId: string; groupId: string; isMultiDay?: boolean; hoursPerDay?: number; timeOfDay?: string }
  ) {
    return this.mappingsService.assign(req.user._id.toString(), body);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.mappingsService.findAll(req.user._id.toString());
  }

  @Delete(':eventId')
  async remove(@Req() req: any, @Param('eventId') eventId: string) {
    return this.mappingsService.remove(req.user._id.toString(), eventId);
  }
}