import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AuthProvider } from '../../common/enums/auth-provider.enum';

export type UserDocument = User & Document;

export enum UserRole {
  STUDENT = 'Student',
  INSTRUCTOR = 'Instructor',
  ADMIN = 'Admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ 
    type: String, 
    enum: UserRole,
    required: true 
  })
  role: UserRole;

  @Prop({ default: '' })
  profilePicture: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  gpa: number;

  @Prop()
  creditHours: number;

  @Prop()
  academicLevel: string;

  @Prop()
  preferredLanguage: string;

  @Prop()
  avatar: string;

  @Prop()
  bio: string;

  @Prop({ type: String, enum: AuthProvider, default: AuthProvider.LOCAL })
  authProvider: AuthProvider;

  @Prop({ type: Object })
  profile: {
    avatar?: string;
    bio?: string;
    academicLevel?: string;
    preferredLanguage?: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add only necessary indexes
UserSchema.index({ email: 1 }); 