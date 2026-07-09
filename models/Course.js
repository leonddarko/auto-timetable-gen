import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  title: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true, // e.g., "Computer Science"
  },
  level: {
    type: String,
    required: true, // e.g., "Level 200" -> Essential for preventing student-level clashes
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weeklyHours: {
    type: Number,
    required: true,
    default: 2, // Number of periods this course needs per week
  }
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);