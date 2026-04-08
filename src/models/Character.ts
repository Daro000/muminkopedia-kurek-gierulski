import mongoose, { Document } from "mongoose";

export interface Character extends Document {
    name: string;
    description: string;
    species: string;
    isHibernating: boolean;
    bestFriend?: mongoose.Types.ObjectId;
}

const CharacterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    species: { type: String, required: true },
    isHibernating: { type: Boolean, default: false },
    bestFriend: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Character",
        default: null,
    },
});

export default mongoose.model<Character>("Character", CharacterSchema);