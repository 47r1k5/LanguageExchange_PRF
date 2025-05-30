import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import {ERole} from '../enums/ERole';

const SALT_FACTOR = 10;

export interface IUser extends Document {
    first_name?: string;
    last_name?: string;
    email: string;
    password: string;
    languages_known?: string[];
    languages_learning?: string[];
    bio?: string;
    classes?: mongoose.Types.ObjectId[];
    role:ERole;
    createdAt: Date;
    comparePassword: (candidatePassword: string, callback: (error: Error | null, isMatch: boolean) => void) => void;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    languages_known: { type: [String], required: true },
    languages_learning: { type: [String], required: true},
    bio: { type: String, required: false },
    classes: { type: [mongoose.Types.ObjectId], ref: 'Class', required: false },
    role: { type: String, enum: Object.values(ERole), default: ERole.USER },
    createdAt: { type: Date, required: false},
});

// hook
UserSchema.pre<IUser>('save', function(next) {
    const user = this;
    
    // hash password
    bcrypt.genSalt(SALT_FACTOR, (error, salt) => {
        if (error) {
            return next(error);
        }
        bcrypt.hash(user.password, salt, (err, encrypted) => {
            if (err) {
                return next(err);
            }
            user.password = encrypted;
            next();
        });
    });

    if(user.languages_known!= undefined && user.languages_learning!= undefined ) {
        if (user.languages_learning.some(language => user.languages_known!.includes(language))) {
            return next(new Error("You cannot learn a language you already know."));
        }
    }

    this.createdAt = new Date();
});

UserSchema.methods.comparePassword = function(candidatePassword: string, callback: (error: Error | null, isMatch: boolean) => void): void {
    const user = this;
    bcrypt.compare(candidatePassword, user.password, (error, isMatch) => {
        if (error) {
            callback(error, false);
        }
        callback(null, isMatch);
    });
}

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
