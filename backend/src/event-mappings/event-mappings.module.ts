import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventMapping, EventMappingSchema } from './schemas/event-mapping.schema.js';
import { EventMappingsService } from './event-mappings.service.js';
import { EventMappingsController } from './event-mappings.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EventMapping.name, schema: EventMappingSchema }]),
  ],
  controllers: [EventMappingsController],
  providers: [EventMappingsService],
  exports: [EventMappingsService],
})
export class EventMappingsModule {}
