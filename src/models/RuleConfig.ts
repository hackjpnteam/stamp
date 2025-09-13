import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRuleConfig extends Document {
  group: mongoose.Types.ObjectId
  allowMultiplePerDay: boolean
  graceMinutes: number
  perfectAttendanceBadge: boolean
  createdAt: Date
  updatedAt: Date
}

const RuleConfigSchema = new Schema<IRuleConfig>(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true, unique: true },
    allowMultiplePerDay: { type: Boolean, default: false },
    graceMinutes: { type: Number, default: 0 },
    perfectAttendanceBadge: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export const RuleConfig: Model<IRuleConfig> = mongoose.models.RuleConfig || mongoose.model<IRuleConfig>('RuleConfig', RuleConfigSchema)