import express, { Request, Response } from "express";
import ArtifactModel, { Artifact } from "../models/Artifact.js";

const router = express.Router();

// wszystkie
router.get("/", async (req: Request, res: Response) => {
    try {
        const artifacts: Array<Artifact> = await ArtifactModel.find().populate("owner", "name species");
        res.json(artifacts);
    } catch (err) {
        res.status(500).json({ error: `Nie udało się pobrać artefaktów: ${err}` });
    }
});

// po id
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const artifact: Artifact | null = await ArtifactModel.findById(id).populate("owner", "name species");
        if (!artifact) {
            res.status(404).json({ error: "Nie znaleziono artefaktu" });
            return;
        }
        res.json(artifact);
    } catch (err) {
        res.status(500).json({ error: `Nie udało się pobrać artefaktu: ${err}` });
    }
});

// post
router.post("/", async (req: Request, res: Response) => {
    try {
        const { name, properties, owner } = req.body;
        const newArtifact: Artifact = new ArtifactModel({ name, properties, owner });
        await newArtifact.save();
        res.status(201).json({ message: `Dodano artefakt: ${newArtifact.name}`, artifact: newArtifact });
    } catch (err) {
        res.status(500).json({ error: `Nie udało się dodać artefaktu: ${err}` });
    }
});

// put
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedArtifact: Artifact | null = await ArtifactModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedArtifact) {
            res.status(404).json({ error: "Nie znaleziono artefaktu" });
            return;
        }
        res.json({ message: `Zaktualizowano artefakt`, artifact: updatedArtifact });
    } catch (err) {
        res.status(500).json({ error: `Nie udało się zaktualizować artefaktu: ${err}` });
    }
});

// delete
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedArtifact = await ArtifactModel.findByIdAndDelete(id);
        if (!deletedArtifact) {
            res.status(404).json({ error: "Nie znaleziono artefaktu" });
            return;
        }
        res.json({ message: `Usunięto artefakt: ${deletedArtifact.name}` });
    } catch (err) {
        const error = err instanceof Error ? err : new Error("Nieznany błąd");
        res.status(500).json({ error: `Nie udało się usunąć artefaktu: ${error.message}` });
    }
});

export default router;