import { Request, Response } from "express";
import { Artifact } from "../models/Artifact.js";
import ArtifactService from "../services/ArtifactService.js";

const handleError = (
  res: Response,
  err: unknown,
  fallbackMessage: string,
): void => {
  if (ArtifactService.isServiceError(err)) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const error = err instanceof Error ? err : new Error("Nieznany błąd");
  res.status(500).json({ error: `${fallbackMessage}: ${error.message}` });
};

const getSingleIdParam = (id: string | string[]): string => {
  if (Array.isArray(id)) {
    return id[0] ?? "";
  }

  return id;
};

const ArtifactController = {
  // GET /api/artifacts
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const artifacts: Array<Artifact> = await ArtifactService.findAll();
      res.json(artifacts);
    } catch (err) {
      handleError(res, err, "Nie udało się pobrać artefaktów");
    }
  },

  // GET /api/artifacts/:id
  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getSingleIdParam(req.params.id);
      const artifact: Artifact | null = await ArtifactService.findById(id);
      if (!artifact) {
        res.status(404).json({ error: "Nie znaleziono artefaktu" });
        return;
      }
      res.json(artifact);
    } catch (err) {
      handleError(res, err, "Nie udało się pobrać artefaktu");
    }
  },

  // POST /api/artifacts
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const newArtifact: Artifact = await ArtifactService.create(req.body);
      res.status(201).json({
        message: `Dodano artefakt: ${newArtifact.name}`,
        artifact: newArtifact,
      });
    } catch (err) {
      handleError(res, err, "Nie udało się dodać artefaktu");
    }
  },

  // PUT /api/artifacts/:id
  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getSingleIdParam(req.params.id);
      const updatedArtifact: Artifact | null = await ArtifactService.update(
        id,
        req.body,
      );
      if (!updatedArtifact) {
        res.status(404).json({ error: "Nie znaleziono artefaktu" });
        return;
      }
      res.json({
        message: "Zaktualizowano artefakt",
        artifact: updatedArtifact,
      });
    } catch (err) {
      handleError(res, err, "Nie udało się zaktualizować artefaktu");
    }
  },

  // DELETE /api/artifacts/:id
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getSingleIdParam(req.params.id);
      const deletedArtifact = await ArtifactService.delete(id);
      if (!deletedArtifact) {
        res.status(404).json({ error: "Nie znaleziono artefaktu" });
        return;
      }
      res.json({ message: `Usunięto artefakt: ${deletedArtifact.name}` });
    } catch (err) {
      handleError(res, err, "Nie udało się usunąć artefaktu");
    }
  },
};

export default ArtifactController;
