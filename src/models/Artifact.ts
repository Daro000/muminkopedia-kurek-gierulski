import mongoose, { Document } from "mongoose";

export interface Artifact extends Document {
  name: string;
  properties: string;
  owner?: mongoose.Types.ObjectId | null;
}

const ArtifactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  properties: { type: String, required: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Character",
    default: null,
  },
});

export default mongoose.model<Artifact>("Artifact", ArtifactSchema);
