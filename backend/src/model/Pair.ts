import mongoose, { Document, Schema } from 'mongoose';

export interface IPair extends Document {
  userA: mongoose.Types.ObjectId;
  userB: mongoose.Types.ObjectId;
  languageA:string;
  languageB:string;
  createdAt: Date;
}

const PairSchema = new Schema<IPair>({
  userA: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userB: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  languageA: { type: String, required: true },
  languageB: { type: String, required: true },
  createdAt: { type: Date}
});

PairSchema.pre<IPair>('save', function(next) {
  const pair = this;
  if (pair.userA.equals(pair.userB)) {
    return next(new Error("You cannot pair with yourself."));
  }
  if (pair.languageA === pair.languageB) {
    return next(new Error("You cannot pair with the same language."));
  }
  this.createdAt = new Date();
  next();
})

export const Pair = mongoose.model<IPair>('Pair', PairSchema);