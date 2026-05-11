import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/modules/user/user.schema';
import * as bcrypt from 'bcrypt';
import { modules, salts } from 'src/types/constants';
import { Role, RoleDocument } from 'src/modules/role/role.schema';

@Injectable()
export class UserSeederService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    ) { }

    async run() {
        const hashedPassword = await bcrypt.hash('superadmin', salts);

        let master;

        // check for existing master role
        const existingRole = await this.roleModel.findOne({ role_name: 'MASTER' });
        if (existingRole) {
            console.log('Master role already exists');
            master = existingRole;
        } else {
            const masterRole = await this.roleModel.create({
                role_name: 'MASTER',
                modules
            })
            master = masterRole;
        }

        // check for existing master user
        const existing = await this.userModel.findOne({ $or: [{ username: 'superadmin' }, { email: 'superadmin@admin.com' }] });
        if (existing) {
            console.error('Superadmin user already exists');
            return;
        }
        
        await this.userModel.create({
            username: 'superadmin',
            first_name: 'Super',
            last_name: 'Admin',
            password: hashedPassword,
            email: 'superadmin@admin.com',
            role: master._id,
            verified: true,
        });

        console.info('🚀 Superadmin user seeded successfully');
    }
}
