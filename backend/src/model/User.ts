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
    language_learning?: string;
    bio?: string;
    classes?: string[];
    role:ERole;
    createdAt: Date;
    comparePassword: (candidatePassword: string, callback: (error: Error | null, isMatch: boolean) => void) => void;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
    first_name: { type: String, required: false },
    last_name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    languages_known: { type: [String], required: false },
    language_learning: { type: String, required: false},
    bio: { type: String, required: false },
    classes: { type: [String], ref: 'Class', required: false },
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

    if(user.languages_known!= undefined && user.language_learning) {
        if(user.languages_known.includes(user.language_learning)) {
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
