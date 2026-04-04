import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from 'src/modules/auth/auth.schema';
import { User, UserDocument } from 'src/modules/user/user.schema';

@Injectable()
export class AuthSeederService {
  constructor(
    @InjectModel(Auth.name) private readonly authModel: Model<AuthDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  async run() {
    const user = await this.userModel.findOne().populate('role');
    if (!user || !user.role) {
      console.warn('⚠️ No user/role found for auth seeding');
      return;
    }

    const existing = await this.authModel.findOne({
      user_id: user._id,
      user_agent: 'seeder-agent',
    });

    if (existing) return;

    await this.authModel.create({
      user_id: user._id,
      role: (user.role as any)._id,
      token: 'seed-auth-token',
      user_agent: 'seeder-agent',
    });

    console.info('🚀 Seeded Auth session');
  }
}
