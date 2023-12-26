import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;
const InfoSchema = mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  userId: {
    type: ObjectId,
    ref: 'UserModel',
  },
});

const AdditionalInformationModel =
  mongoose.models.AdditionalInformationModel ||
  mongoose.model('AdditionalInformationModel', InfoSchema);

export default AdditionalInformationModel;
