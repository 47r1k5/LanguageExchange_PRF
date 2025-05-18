import mongoose from "mongoose";
import {EClassLevel} from "../enums/EClassLevel";
import {User} from "./User";

export interface IClass extends Document {
    name: string;
    description: string;
    learn_language: string;
    speak_language: string;
    level: EClassLevel;
    free_space: number;
    startDate: Date;
    endDate: Date;
    loc: string;
    teacherId: mongoose.Schema.Types.ObjectId;
    studentsIds: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const ClassSchema = new mongoose.Schema<IClass>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    learn_language: { type: String, required: true },
    speak_language: { type: String, required: true },
    level: { type: String, enum: Object.keys(EClassLevel), required: true },
    free_space: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    loc: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentsIds: { type: [mongoose.Types.ObjectId], ref: 'User', required: false },
    createdAt: { type: Date},
});

ClassSchema.pre<IClass>('save', function(next) {
    if (this.startDate >= this.endDate) {
        return next(new Error("Start date must be before end date."));
    }

    if(this.free_space < 0) {
        return next(new Error("Free space cannot be negative."));
    }

    if(this.speak_language === this.learn_language) {
        return next(new Error("You cannot learn and speak the same language."));
    }

    this.createdAt = new Date();
    next();
});

export const Class = mongoose.model<IClass>('Class', ClassSchema);