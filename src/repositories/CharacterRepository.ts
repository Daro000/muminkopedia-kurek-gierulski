import CharacterModel, { Character } from "../models/Character.js";
import ArtifactModel from "../models/Artifact.js";

const CharacterRepository = {
    findAll: async () => {
        return await CharacterModel.find().populate("bestFriend", "name species");
    },

    findById: async (id: string) => {
        return await CharacterModel.findById(id).populate("bestFriend", "name species");
    },

    create: async (data: Partial<Character>) => {
        return await new CharacterModel(data).save();
    },

    update: async (id: string, data: Partial<Character>) => {
        return await CharacterModel.findByIdAndUpdate(id, data, { new: true });
    },

    delete: async (id: string) => {
        const deleted = await CharacterModel.findByIdAndDelete(id);
        if (deleted) {
            // po usunieciu null dla wlasciciela
            await ArtifactModel.updateMany({ owner: id }, { $set: { owner: null } });
        }
        return deleted;
    }
};

export default CharacterRepository;