import { Schema, model, type InferSchemaType } from 'mongoose';

const messageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ read: 1, createdAt: -1 });

export type MessageDoc = InferSchemaType<typeof messageSchema>;

export const Message = model('Message', messageSchema);