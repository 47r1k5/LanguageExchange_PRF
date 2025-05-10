import mongoose from "mongoose";
import {EClassLevel} from "../enums/EClassLevel";

export interface IClass extends Document {
    name: string;
    description: string;
    language: string;
    level: EClassLevel;
    free_space: number;
    startDate: Date;
    endDate: Date;
    loc: string;
    teacherId: string;
    studentsIds: string[];
    createdAt: Date;
}

const ClassSchema = new mongoose.Schema<IClass>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    level: { type: String, enum: Object.keys(EClassLevel), required: true },
    free_space: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    loc: { type: String, required: true },
    teacherId: { type: String, ref: 'User', required: true },
    studentsIds: { type: [String], ref: 'User', required: false },
    createdAt: { type: Date},
});

ClassSchema.pre<IClass>('save', function(next) {
    const classInstance = this;
    if (classInstance.startDate >= classInstance.endDate) {
        return next(new Error("Start date must be before end date."));
    }
    this.createdAt = new Date();
    next();
});

export const Class = mongoose.model<IClass>('Class', ClassSchema);