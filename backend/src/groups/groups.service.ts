import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Group } from './schemas/group.schema.js';
import { EventMapping } from '../event-mappings/schemas/event-mapping.schema.js';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(EventMapping.name) private mappingModel: Model<EventMapping>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(userId: string, createGroupDto: { name: string; color: string }) {
    const group = new this.groupModel({
      userId: new Types.ObjectId(userId),
      name: createGroupDto.name,
      color: createGroupDto.color || '#3b82f6',
    });
    return group.save();
  }

  async findAll(userId: string) {
    return this.groupModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async update(userId: string, id: string, updateDto: { name?: string; color?: string }) {
    return this.groupModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { $set: updateDto },
      { new: true },
    ).exec();
  }

  async remove(userId: string, id: string) {
    const userObjectId = new Types.ObjectId(userId);
    const groupObjectId = new Types.ObjectId(id);

    // Use MongoDB transaction for atomicity - ensures group and mappings are deleted together
    // This prevents race conditions where group is deleted but mappings remain (or vice versa)
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. First, find all mappings for this group to unassign them
      const mappingsToDelete = await this.mappingModel
        .find({ userId: userObjectId, groupId: groupObjectId })
        .session(session)
        .exec();

      // 2. Delete all mappings for this group (unassign events from group)
      if (mappingsToDelete.length > 0) {
        await this.mappingModel
          .deleteMany({ userId: userObjectId, groupId: groupObjectId })
          .session(session)
          .exec();
      }

      // 3. Delete the group itself
      const deletedGroup = await this.groupModel
        .findOneAndDelete({ _id: groupObjectId, userId: userObjectId })
        .session(session)
        .exec();

      await session.commitTransaction();
      return deletedGroup;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}