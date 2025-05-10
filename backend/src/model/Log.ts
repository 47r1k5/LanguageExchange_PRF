import mongoose, { Document } from "mongoose";
import {ELogType} from "../enums/ELogType";

export interface ILog extends Document {
  type: ELogType;
  message: string;
  timestamp: Date;
}

const LogSchema = new mongoose.Schema<ILog>({
  type: { type: String, enum: Object.values(ELogType), required: true },
  message: { type: String, required: true },
  timestamp: { type: Date},
});

LogSchema.pre<ILog>("save", function (next) {
  const log = this;
  log.timestamp = new Date();
  next();
});

export const Log = mongoose.model<ILog>("Log", LogSchema);