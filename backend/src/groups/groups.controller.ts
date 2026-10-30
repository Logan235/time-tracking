import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupsService } from './groups.service.js';

@Controller('groups')
@UseGuards(AuthGuard('jwt'))
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: { name: string; color: string }) {
    return this.groupsService.create(req.user._id.toString(), body);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.groupsService.findAll(req.user._id.toString());
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; color?: string },
  ) {
    return this.groupsService.update(req.user._id.toString(), id, body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.groupsService.remove(req.user._id.toString(), id);
  }
}