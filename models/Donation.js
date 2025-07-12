import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  item: String,
  quantity: Number,
  status: String,
  location: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Donation', donationSchema);
