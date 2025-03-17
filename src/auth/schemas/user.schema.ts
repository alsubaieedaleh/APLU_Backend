import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  versionKey: false,
  _id: false,
  strict: true,
  timestamps: false,
})
export class User {
  @Prop({ required: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 