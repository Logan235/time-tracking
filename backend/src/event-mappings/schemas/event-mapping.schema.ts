import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class EventMapping extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  eventId: string;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  groupId: Types.ObjectId;

  @Prop({ default: false })
  isMultiDay: boolean;

  @Prop({ default: 2 })
  hoursPerDay: number;

  @Prop({ default: 'flexible' })
  timeOfDay: string;
}

export const EventMappingSchema = SchemaFactory.createForClass(EventMapping);
