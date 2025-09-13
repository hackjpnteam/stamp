import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAttendance extends Document {
  user: mongoose.Types.ObjectId
  event: mongoose.Types.ObjectId
  date: string
  method: 'qr' | 'manual' | 'auto'
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    date: { type: String, required: true },
    method: { 
      type: String, 
      enum: ['qr', 'manual', 'auto'],
      required: true
    }
  },
  { timestamps: true }
)

AttendanceSchema.index({ user: 1, event: 1, date: 1 }, { unique: true })

export const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema)