import CharacterModel, { Character } from "../models/Character.js";

const CharacterRepository = {
  findAll: async () => {
    return await CharacterModel.find().populate("bestFriend", "name species");
  },

  findById: async (id: string) => {
    return await CharacterModel.findById(id).populate(
      "bestFriend",
      "name species",
    );
  },

  create: async (data: Partial<Character>) => {
    return await new CharacterModel(data).save();
  },

  update: async (id: string, data: Partial<Character>) => {
    return await CharacterModel.findByIdAndUpdate(id, data, { new: true });
  },

  clearBestFriendByCharacterId: async (characterId: string) => {
    return await CharacterModel.updateMany(
      { bestFriend: characterId },
      { $set: { bestFriend: null } },
    );
  },

  delete: async (id: string) => {
    return await CharacterModel.findByIdAndDelete(id);
  },
};

export default CharacterRepository;
