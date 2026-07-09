import mongoose from 'mongoose';

const VenueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // e.g., "Lab 3" or "Room 402"
  },
  capacity: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

export default mongoose.models.Venue || mongoose.model('Venue', VenueSchema);