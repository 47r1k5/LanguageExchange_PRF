import mongoose from "mongoose";

export interface ILanguage extends Document {
    name: string;
}

const LanguageSchema = new mongoose.Schema<ILanguage>({
    name: { type: String, unique:true, required: true },
});

export const Language = mongoose.model<ILanguage>('Language', LanguageSchema);