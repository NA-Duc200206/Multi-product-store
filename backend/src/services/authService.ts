import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, AuditLog } from '../models';

export const authService = {
  async login(email: string, password: string, ipAddress: string) {
    if (!email || !password) {
      const error: any = new Error('Email and password are required.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const error: any = new Error('Incorrect email or password.');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      const error: any = new Error('Incorrect email or password.');
      error.statusCode = 400;
      throw error;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super_secret_jwt_key_glowstore_2026',
      { expiresIn: '24h' }
    );

    const userObj = user.toObject();
    delete (userObj as any).password;
    const formattedUser = {
      ...userObj,
      id: userObj._id
    };

    try {
      await AuditLog.create({
        userId: user._id as any,
        action: 'LOGIN',
        targetType: 'User',
        targetId: user._id.toString(),
        ipAddress: ipAddress || ''
      });
    } catch (logErr) {
      console.error('Failed to create login audit log:', logErr);
    }

    return { token, user: formattedUser };
  },

  async register(name: string, email: string, password: string, ipAddress: string) {
    if (!name || !email || !password) {
      const error: any = new Error('Please fill in all fields.');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error: any = new Error('Email already exists.');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer'
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super_secret_jwt_key_glowstore_2026',
      { expiresIn: '24h' }
    );

    const userObj = user.toObject();
    delete (userObj as any).password;
    const formattedUser = {
      ...userObj,
      id: userObj._id
    };

    try {
      await AuditLog.create({
        userId: user._id as any,
        action: 'REGISTER',
        targetType: 'User',
        targetId: user._id.toString(),
        ipAddress: ipAddress || ''
      });
    } catch (logErr) {
      console.error('Failed to create registration audit log:', logErr);
    }

    return { token, user: formattedUser };
  },

  async getProfile(userDoc: any) {
    const userObj = userDoc.toObject();
    delete userObj.password;
    return {
      ...userObj,
      id: userObj._id
    };
  },

  async syncCart(userDoc: any, cart: any[]) {
    if (!cart || !Array.isArray(cart)) {
      const error: any = new Error('Cart items must be an array.');
      error.statusCode = 400;
      throw error;
    }

    userDoc.cart = cart;
    await userDoc.save();
    return true;
  },

  async getAllUsers() {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return users.map(u => ({
      ...u.toObject(),
      id: u._id
    }));
  },

  async updateUserRole(userId: string, role: string) {
    const validRoles = ['customer', 'admin', 'warehouse', 'support'];
    if (!validRoles.includes(role)) {
      const error: any = new Error('Invalid role specified.');
      error.statusCode = 400;
      throw error;
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return {
      ...user.toObject(),
      id: user._id
    };
  },

  async updateProfile(userDoc: any, data: { name?: string; avatar?: string }) {
    if (data.name) userDoc.name = data.name.trim();
    if (data.avatar) userDoc.avatar = data.avatar.trim();
    await userDoc.save();
    const obj = userDoc.toObject();
    delete obj.password;
    return {
      ...obj,
      id: obj._id
    };
  }
};
