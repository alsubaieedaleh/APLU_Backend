import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { AuthProvider as AuthProviderEnum } from '../../common/enums/auth-provider.enum';

export type AuthProviderDocument = AuthProvider & Document;

@Schema({ timestamps: true })
export class AuthProvider {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true, enum: AuthProviderEnum })
  provider: string;

  @Prop({ required: true })
  providerId: string;

  @Prop({ type: Object })
  tokens: {
    accessToken?: string;
    refreshToken?: string;
  };

  @Prop({ type: Date })
  lastLogin: Date;
}

export const AuthProviderSchema = SchemaFactory.createForClass(AuthProvider); 