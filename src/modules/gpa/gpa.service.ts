import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GPA, GPADocument } from './schemas/gpa.schema';

@Injectable()
export class GPAService {
  constructor(
    @InjectModel(GPA.name)
    private gpaModel: Model<GPADocument>,
  ) {}

  // Retrieve the GPA record for a specific user
  async getGPA(userId: string): Promise<GPA> {
    const gpaRecord = await this.gpaModel.findOne({ userId }).exec();
    if (!gpaRecord) {
      throw new NotFoundException('GPA record not found for user');
    }
    return gpaRecord;
  }

  // Update existing GPA record or create a new one if not exists.
  // Expected gpaData includes: currentGPA, totalCredits, projectedGPA
  async updateGPA(gpaData: any): Promise<GPA> {
    const { userId } = gpaData;
    const updatedGPA = await this.gpaModel.findOneAndUpdate(
      { userId },
      { 
        $set: {
          currentGPA: gpaData.currentGPA,
          totalCredits: gpaData.totalCredits,
          projectedGPA: gpaData.projectedGPA,
        }
      },
      { new: true, upsert: true }
    ).exec();
    return updatedGPA;
  }
  

  // Return the projected GPA for the user.
  // You can also add calculation logic here if needed.
  async projectGPA(userId: string): Promise<{ projectedGPA: number }> {
    const gpaRecord = await this.gpaModel.findOne({ userId }).exec();
    if (!gpaRecord) {
      throw new NotFoundException('GPA record not found for user');
    }
    return { projectedGPA: gpaRecord.projectedGPA };
  }
}
