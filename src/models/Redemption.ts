import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRedemption extends Document {
  user: mongoose.Types.ObjectId
  reward: mongoose.Types.ObjectId
  status: 'requested' | 'approved' | 'rejected' | 'fulfilled'
  createdAt: Date
  updatedAt: Date
}

const RedemptionSchema = new Schema<IRedemption>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reward: { type: Schema.Types.ObjectId, ref: 'Reward', required: true },
    status: { 
      type: String, 
      enum: ['requested', 'approved', 'rejected', 'fulfilled'],
      default: 'requested'
    }
  },
  { timestamps: true }
)

export const Redemption: Model<IRedemption> = mongoose.models.Redemption || mongoose.model<IRedemption>('Redemption', RedemptionSchema)