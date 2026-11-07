import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: Schema.Types.ObjectId;
  action: string;
  targetType: string;
  targetId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: { type: String, required: true },
  targetId: { type: String, required: true },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  ipAddress: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false } // only need createdAt
});

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
