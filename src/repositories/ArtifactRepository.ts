import ArtifactModel, { Artifact } from "../models/Artifact.js";

const ArtifactRepository = {
  findAll: async () => {
    return await ArtifactModel.find().populate("owner", "name species");
  },

  findById: async (id: string) => {
    return await ArtifactModel.findById(id).populate("owner", "name species");
  },

  create: async (data: Partial<Artifact>) => {
    return await new ArtifactModel(data).save();
  },

  update: async (id: string, data: Partial<Artifact>) => {
    return await ArtifactModel.findByIdAndUpdate(id, data, { new: true });
  },

  clearOwnerByCharacterId: async (characterId: string) => {
    return await ArtifactModel.updateMany(
      { owner: characterId },
      { $set: { owner: null } },
    );
  },

  delete: async (id: string) => {
    return await ArtifactModel.findByIdAndDelete(id);
  },
};

export default ArtifactRepository;
