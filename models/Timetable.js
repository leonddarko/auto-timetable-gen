import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  period: {
    type: String,
    required: true, // e.g., "08:00 - 10:00" or "Period 1"
  }
}, { timestamps: true });

// Indexing these fields makes clash detection queries lightning fast in MongoDB Atlas
TimetableSchema.index({ day: 1, period: 1 });

export default mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema);