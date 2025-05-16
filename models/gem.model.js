import mongoose from 'mongoose';

const gemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  carat: { type: Number, required: true }, 
  shortdes: { type: String },
  des: { type: String },
  image: { data: Buffer, contentType: String }, 
}, { timestamps: true });

const Gem = mongoose.model('Gem', gemSchema);
export default Gem;
