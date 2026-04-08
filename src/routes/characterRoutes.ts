import express, { Request, Response } from "express";
import CharacterModel, { Character } from "../models/Character.js";
import ArtifactModel from "../models/Artifact.js";

const router = express.Router();

// wszystskie
router.get("/", async (req: Request, res: Response) => {
    try {
        const characters: Array<Character> = await CharacterModel.find().populate("bestFriend", "name species");
        res.json(characters);
    } catch (err) {
        res.status(500).json({ error: `Nie udało się pobrać postaci: ${err}` });
    }
});

// wyswietla po id
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const character: Character | null = await CharacterModel.findById(id).populate("bestFriend", "name species");
        if (!character) {
            res.status(404).json({ error: "Nie znaleziono postaci" });
            return;
        }
        res.json(character);
    } catch (err) {
        res.status(500).json({ error: `Nie udało się pobrać postaci: ${err}` });
    }
});

// post
router.post("/", async (req: Request, res: Response) => {
    try {
        const { name, description, species, isHibernating, bestFriend } = req.body;
        const newCharacter: Character = new CharacterModel({ name, description, species, isHibernating, bestFriend });
        await newCharacter.save();
        res.status(201).json({ message: `Dodano postać: ${newCharacter.name}`, character: newCharacter });
    } catch (err) {
        res.status(500).json({ error: `Nie udało się dodać postaci: ${err}` });
    }
});

// put
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedCharacter: Character | null = await CharacterModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCharacter) {
            res.status(404).json({ error: "Nie znaleziono postaci" });
            return;
        }
        res.json({ message: `Zaktualizowano postać`, character: updatedCharacter });
    } catch (err) {
        res.status(500).json({ error: `Nie udało się zaktualizować postaci: ${err}` });
    }
});

// delete daje null jak sie usunie goscia
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedCharacter = await CharacterModel.findByIdAndDelete(id);
        if (!deletedCharacter) {
            res.status(404).json({ error: "Nie znaleziono postaci" });
            return;
        }
        // Artefakty zostają, ale owner → null
        await ArtifactModel.updateMany({ owner: id }, { $set: { owner: null } });
        res.json({ message: `Usunięto postać: ${deletedCharacter.name}. Artefakty zachowane (owner: null).` });
    } catch (err) {
        const error = err instanceof Error ? err : new Error("Nieznany błąd");
        res.status(500).json({ error: `Nie udało się usunąć postaci: ${error.message}` });
    }
});

export default router;