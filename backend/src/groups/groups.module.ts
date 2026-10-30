import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema.js';
import { EventMapping, EventMappingSchema } from '../event-mappings/schemas/event-mapping.schema.js';
import { GroupsService } from './groups.service.js';
import { GroupsController } from './groups.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: EventMapping.name, schema: EventMappingSchema },
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
