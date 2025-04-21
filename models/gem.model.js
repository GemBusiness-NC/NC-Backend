import mongoose from 'mongoose';

const gemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  carot: { type: String, required: true },
  shortdes: { type: String },
  des: { type: String },
  image: { data: Buffer, contentType: String }, // image stored as binary
}, { timestamps: true });

const Gem = mongoose.model('Gem', gemSchema);
export default Gem;
