import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReward extends Document {
  group: mongoose.Types.ObjectId
  name: string
  requiredStamps: number
  stock: number
  createdAt: Date
  updatedAt: Date
}

const RewardSchema = new Schema<IReward>(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    name: { type: String, required: true },
    requiredStamps: { type: Number, required: true, min: 1 },
    stock: { type: Number, default: -1 }
  },
  { timestamps: true }
)

export const Reward: Model<IReward> = mongoose.models.Reward || mongoose.model<IReward>('Reward', RewardSchema)