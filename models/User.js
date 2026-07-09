import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  role: {
    type: String,
    enum: ['admin', 'lecturer'],
    default: 'lecturer',
  },
  // Flattened department to save you from managing a separate collection
  department: {
    type: String,
    required: function() { return this.role === 'lecturer'; } // Only mandatory for lecturers
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);