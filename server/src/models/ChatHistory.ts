import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage {
  sender: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

export interface IChatHistory extends Document {
  user?: Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: String, enum: ['user', 'bot'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatHistorySchema = new Schema<IChatHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export default model<IChatHistory>('ChatHistory', chatHistorySchema);
