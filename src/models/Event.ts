import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IEvent extends Document {
  title: string
  group: mongoose.Types.ObjectId
  startDate: Date
  endDate: Date
  dailyWindowStart: string
  dailyWindowEnd: string
  requireQr: boolean
  location?: string
  mapUrl?: string
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    dailyWindowStart: { type: String, default: '06:00' },
    dailyWindowEnd: { type: String, default: '09:00' },
    requireQr: { type: Boolean, default: true },
    location: { type: String },
    mapUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

export const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema)