import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventMapping } from './schemas/event-mapping.schema.js';

interface AssignMappingDto {
  eventId: string;
  groupId: string;
  isMultiDay?: boolean;
  hoursPerDay?: number;
  timeOfDay?: string;
}

@Injectable()
export class EventMappingsService {
  constructor(@InjectModel(EventMapping.name) private mappingModel: Model<EventMapping>) {}

  async assign(userId: string, dto: AssignMappingDto) {
    const { eventId, groupId, isMultiDay = false, hoursPerDay = 2, timeOfDay = 'flexible' } = dto;

    const mapping = await this.mappingModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), eventId },
      { 
        $set: { 
          groupId: new Types.ObjectId(groupId),
          isMultiDay,
          hoursPerDay,
          timeOfDay,
        } 
      },
      { upsert: true, new: true },
    ).exec();
    return mapping;
  }

  async remove(userId: string, eventId: string) {
    return this.mappingModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      eventId,
    }).exec();
  }

  async findAll(userId: string) {
    return this.mappingModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async findByEventIds(userId: string, eventIds: string[]) {
    return this.mappingModel.find({
      userId: new Types.ObjectId(userId),
      eventId: { $in: eventIds },
    }).exec();
  }
}