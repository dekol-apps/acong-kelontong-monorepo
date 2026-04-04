import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';
import { addDays } from 'src/utils/helper';
import { sessionDays } from 'src/types/constants';
import { Role, RoleDocument } from '../role/role.schema';

@Schema({ timestamps: true })
export class Auth {

    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    user_id: Types.ObjectId; // Reference to Users collection
    @Prop()
    token: string;
    @Prop()
    user_agent: string;
    @Prop({ type: Types.ObjectId, ref: Role.name, required: true })
    role: Types.ObjectId;
    @Prop({ type: Date, default: addDays(new Date(), sessionDays) })
    expires_at?: Date;

}

export type AuthDocument = Auth & Document & { role: RoleDocument };
export const AuthSchema = SchemaFactory.createForClass(Auth);

// Add index for automatic cleanup (MongoDB TTL)
AuthSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
