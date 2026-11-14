import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, AuditLog } from '../models';

const BCRYPT_SALT_ROUNDS = 12;

function validatePasswordStrength(password: string) {
  if (!password || password.length < 8 || password.length > 128) {
    const error: any = new Error('Password must be between 8 and 128 characters.');
    error.statusCode = 400;
    throw error;
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    const error: any = new Error('Password must include at least one uppercase letter, one lowercase letter, and one number.');
    error.statusCode = 400;
    throw error;
  }
}

function sanitizeUser(userDoc: any) {
  const obj = typeof userDoc.toObject === 'function' ? userDoc.toObject() : { ...userDoc };
  delete obj.password;
  delete obj.refreshTokens;
  return {
    ...obj,
    id: obj._id
  };
}

export const authService = {
  async login(email: string, password: string, ipAddress: string) {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      const error: any = new Error('Email and password are required.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
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

    const formattedUser = sanitizeUser(user);

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
    const trimmedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();
    if (!trimmedName || !normalizedEmail || !password) {
      const error: any = new Error('Please fill in all fields.');
      error.statusCode = 400;
      throw error;
    }

    validatePasswordStrength(password);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error: any = new Error('Email already exists.');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'customer'
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super_secret_jwt_key_glowstore_2026',
      { expiresIn: '24h' }
    );

    const formattedUser = sanitizeUser(user);

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
    if (data.name !== undefined) {
      const trimmedName = String(data.name).trim();
      if (trimmedName.length < 2 || trimmedName.length > 80) {
        const error: any = new Error('Name must be between 2 and 80 characters.');
        error.statusCode = 400;
        throw error;
      }
      userDoc.name = trimmedName;
    }

    if (data.avatar !== undefined) {
      const trimmedAvatar = String(data.avatar).trim();
      if (trimmedAvatar.length > 500) {
        const error: any = new Error('Avatar URL is too long.');
        error.statusCode = 400;
        throw error;
      }
      userDoc.avatar = trimmedAvatar;
    }

    await userDoc.save();
    const obj = userDoc.toObject();
    delete obj.password;
    return {
      ...obj,
      id: obj._id
    };
  },

  async changePassword(userDoc: any, data: { currentPassword?: string; newPassword?: string }) {
    const currentPassword = data?.currentPassword || '';
    const newPassword = data?.newPassword || '';

    if (!currentPassword || !newPassword) {
      const error: any = new Error('Current password and new password are required.');
      error.statusCode = 400;
      throw error;
    }

    validatePasswordStrength(newPassword);

    if (currentPassword === newPassword) {
      const error: any = new Error('New password must be different from your current password.');
      error.statusCode = 400;
      throw error;
    }

    const userWithPassword = await User.findById(userDoc._id).select('+password');
    if (!userWithPassword) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, userWithPassword.password || '');
    if (!isMatch) {
      const error: any = new Error('Current password is incorrect.');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    userWithPassword.password = await bcrypt.hash(newPassword, salt);
    await userWithPassword.save();

    try {
      await AuditLog.create({
        userId: userDoc._id as any,
        action: 'CHANGE_PASSWORD',
        targetType: 'User',
        targetId: userDoc._id.toString(),
        ipAddress: ''
      });
    } catch (logErr) {
      console.error('Failed to create password change audit log:', logErr);
    }

    return true;
  }
};
