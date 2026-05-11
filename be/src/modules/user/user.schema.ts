import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { isEmail } from 'class-validator';
import { Document, Types } from 'mongoose';
import { Role, RoleDocument } from '../role/role.schema';
@Schema()
export class User {

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true, validate: [isEmail, 'Invalid email'] })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  verified?: boolean;

  @Prop({ type: Types.ObjectId, ref: Role.name, required: true })
  role: Types.ObjectId;

  @Prop()
  user_photo?: string;

  @Prop({ required: false, validate: [isEmail, 'Invalid email'] })
  req_change_email?: string;

  @Prop({ type: Date })
  req_change_email_due_time?: Date;

}

export type UserDocument = User & Document & { role: RoleDocument };
export const UserSchema = SchemaFactory.createForClass(User);
