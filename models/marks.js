import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;
const MarksSchema = mongoose.Schema({
  passPercent: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  userId: {
    type: ObjectId,
    ref: 'UserModel',
  },
});

const MarksModel =
  mongoose.models.MarksModel || mongoose.model('MarksModel', MarksSchema);

export default MarksModel;
