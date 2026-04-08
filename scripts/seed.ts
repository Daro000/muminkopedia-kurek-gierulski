import mongoose from "mongoose";
import dotenv from "dotenv";

import CharacterModel from "../src/models/Character";
import ArtifactModel from "../src/models/Artifact";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    await ArtifactModel.deleteMany({});
    await CharacterModel.deleteMany({});

    const muminek = await CharacterModel.create({
      name: "Muminek",
      description: "Główny bohater, ciekawski i odważny.",
      species: "Muminek",
      isHibernating: false,
    });

    const wloczykij = await CharacterModel.create({
      name: "Włóczykij",
      description: "Wędrowiec kochający wolność i naturę.",
      species: "Włóczykij",
      isHibernating: false,
    });

    const mama = await CharacterModel.create({
      name: "Mama Muminka",
      description: "Opiekuńcza i spokojna, zawsze pomaga innym.",
      species: "Muminek",
      isHibernating: false,
    });

    const paszczak = await CharacterModel.create({
      name: "Paszczak",
      description: "Urzędnik i kolekcjoner, lubi porządek.",
      species: "Paszczak",
      isHibernating: false,
    });

    muminek.bestFriend = wloczykij._id;
    await muminek.save();

    wloczykij.bestFriend = muminek._id;
    await wloczykij.save();

    await ArtifactModel.insertMany([
      {
        name: "Kapelusz Tajemniczego Pana",
        properties: "Zmienia rzeczy wrzucone do środka w coś zupełnie innego.",
        owner: muminek._id,
      },
      {
        name: "Harmonijka",
        properties: "Gra melancholijne melodie.",
        owner: wloczykij._id,
      },
      {
        name: "Torebka Mamy Muminka",
        properties: "Zawsze zawiera potrzebne rzeczy.",
        owner: mama._id,
      },
      {
        name: "Katalog Paszczaka",
        properties: "Zawiera uporządkowane informacje o wszystkim.",
        owner: paszczak._id,
      },
      {
        name: "Zagubiony Artefakt",
        properties: "Nie wiadomo, do kogo należy.",
        owner: null,
      },
    ]);

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

seedDatabase();
