import mongoose from "mongoose";
import { Artifact } from "../models/Artifact.js";
import ArtifactRepository from "../repositories/ArtifactRepository.js";
import CharacterRepository from "../repositories/CharacterRepository.js";

type ArtifactInput = {
  name?: unknown;
  properties?: unknown;
  owner?: unknown;
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

const ensureOptionalOwnerRef = async (
  value: unknown,
  fieldName: string,
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

  const owner = await CharacterRepository.findById(value);
  if (!owner) {
    throw new ServiceError(400, "Wskazany owner nie istnieje.");
  }

  return new mongoose.Types.ObjectId(value);
};

const ArtifactService = {
  isServiceError: (error: unknown): error is ServiceError =>
    error instanceof ServiceError,

  findAll: async () => {
    return await ArtifactRepository.findAll();
  },

  findById: async (id: string) => {
    ensureObjectId(id, "id");
    return await ArtifactRepository.findById(id);
  },

  create: async (payload: ArtifactInput) => {
    const name = ensureRequiredString(payload.name, "name");
    const properties = ensureRequiredString(payload.properties, "properties");
    const owner = await ensureOptionalOwnerRef(payload.owner, "owner");

    const artifactData: Partial<Artifact> = {
      name,
      properties,
    };

    if (owner !== undefined) {
      artifactData.owner = owner;
    }

    return await ArtifactRepository.create(artifactData);
  },

  update: async (id: string, payload: ArtifactInput) => {
    ensureObjectId(id, "id");

    const name = ensureOptionalString(payload.name, "name");
    const properties = ensureOptionalString(payload.properties, "properties");
    const owner = await ensureOptionalOwnerRef(payload.owner, "owner");

    const updateData: Partial<Artifact> = {};

    if (name !== undefined) {
      updateData.name = name;
    }
    if (properties !== undefined) {
      updateData.properties = properties;
    }
    if (owner !== undefined) {
      updateData.owner = owner;
    }

    return await ArtifactRepository.update(id, updateData);
  },

  delete: async (id: string) => {
    ensureObjectId(id, "id");
    return await ArtifactRepository.delete(id);
  },
};

export default ArtifactService;
