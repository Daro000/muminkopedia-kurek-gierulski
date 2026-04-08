import mongoose from "mongoose";
import { Character } from "../models/Character.js";
import CharacterRepository from "../repositories/CharacterRepository.js";
import ArtifactRepository from "../repositories/ArtifactRepository.js";

type CharacterInput = {
  name?: unknown;
  description?: unknown;
  species?: unknown;
  isHibernating?: unknown;
  bestFriend?: unknown;
};

class ServiceError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const ensureObjectId = (value: string, fieldName: string): void => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ServiceError(400, `Niepoprawny identyfikator pola ${fieldName}.`);
  }
};

const ensureRequiredString = (value: unknown, fieldName: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ServiceError(
      400,
      `Pole ${fieldName} jest wymagane i musi być niepustym tekstem.`,
    );
  }

  return value.trim();
};

const ensureOptionalString = (
  value: unknown,
  fieldName: string,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ServiceError(
      400,
      `Pole ${fieldName} musi być niepustym tekstem.`,
    );
  }

  return value.trim();
};

const ensureOptionalBoolean = (
  value: unknown,
  fieldName: string,
): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new ServiceError(
      400,
      `Pole ${fieldName} musi mieć wartość true albo false.`,
    );
  }

  return value;
};

const ensureOptionalCharacterRef = async (
  value: unknown,
  fieldName: string,
  excludedCharacterId?: string,
): Promise<mongoose.Types.ObjectId | null | undefined> => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || !mongoose.Types.ObjectId.isValid(value)) {
    throw new ServiceError(
      400,
      `Pole ${fieldName} musi być poprawnym ObjectId lub null.`,
    );
  }

  if (excludedCharacterId && value === excludedCharacterId) {
    throw new ServiceError(
      400,
      "Postać nie może wskazywać samej siebie jako najlepszego przyjaciela.",
    );
  }

  const friend = await CharacterRepository.findById(value);
  if (!friend) {
    throw new ServiceError(400, "Wskazany bestFriend nie istnieje.");
  }

  return new mongoose.Types.ObjectId(value);
};

const CharacterService = {
  isServiceError: (error: unknown): error is ServiceError =>
    error instanceof ServiceError,

  findAll: async () => {
    return await CharacterRepository.findAll();
  },

  findById: async (id: string) => {
    ensureObjectId(id, "id");
    return await CharacterRepository.findById(id);
  },

  create: async (payload: CharacterInput) => {
    const name = ensureRequiredString(payload.name, "name");
    const description = ensureRequiredString(
      payload.description,
      "description",
    );
    const species = ensureRequiredString(payload.species, "species");
    const isHibernating = ensureOptionalBoolean(
      payload.isHibernating,
      "isHibernating",
    );
    const bestFriend = await ensureOptionalCharacterRef(
      payload.bestFriend,
      "bestFriend",
    );

    const characterData: Partial<Character> = {
      name,
      description,
      species,
    };

    if (isHibernating !== undefined) {
      characterData.isHibernating = isHibernating;
    }

    if (bestFriend !== undefined) {
      characterData.bestFriend = bestFriend ?? undefined;
    }

    return await CharacterRepository.create(characterData);
  },

  update: async (id: string, payload: CharacterInput) => {
    ensureObjectId(id, "id");

    const name = ensureOptionalString(payload.name, "name");
    const description = ensureOptionalString(
      payload.description,
      "description",
    );
    const species = ensureOptionalString(payload.species, "species");
    const isHibernating = ensureOptionalBoolean(
      payload.isHibernating,
      "isHibernating",
    );
    const bestFriend = await ensureOptionalCharacterRef(
      payload.bestFriend,
      "bestFriend",
      id,
    );

    const updateData: Partial<Character> = {};

    if (name !== undefined) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (species !== undefined) {
      updateData.species = species;
    }
    if (isHibernating !== undefined) {
      updateData.isHibernating = isHibernating;
    }
    if (bestFriend !== undefined) {
      updateData.bestFriend = bestFriend ?? undefined;
    }

    return await CharacterRepository.update(id, updateData);
  },

  delete: async (id: string) => {
    ensureObjectId(id, "id");

    const existingCharacter = await CharacterRepository.findById(id);
    if (!existingCharacter) {
      throw new ServiceError(404, "Nie znaleziono postaci.");
    }

    await Promise.all([
      ArtifactRepository.clearOwnerByCharacterId(id),
      CharacterRepository.clearBestFriendByCharacterId(id),
    ]);

    return await CharacterRepository.delete(id);
  },
};

export default CharacterService;
