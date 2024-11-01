import express, { Request, Response } from "express";
import { Dog } from "./server/models/Dog";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.get("/dogs", (req: Request, res: Response) => {
    fs.readFile("dogs.json", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error retrieving dogs from file");
            return;
        } else {
            const jsonData = JSON.parse(data);
            res.status(200).json({
                message: "Successfully retrieved dogs",
                jsonData,
            });
        }
    });
});

app.get("/dogs/:id", (req: Request, res: Response) => {
    const id = req.params.id;

    fs.readFile("dogs.json", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error retrieving dogs from file");
            return;
        } else {
            const jsonData = JSON.parse(data);
            if (!jsonData[id]) {
                res.status(404).send(
                    `Couldn't find dog with id ${id} in the file`
                );
                return;
            }
            res.status(200).json({
                message: `Successfully retrieved dog with id ${id}`,
                dog: jsonData[id],
            });
        }
    });
});

// TODO add PUT/PATCH to update existing dog

app.post("/dogs", (req: Request, res: Response) => {
    const data = req.body;
    const dog: Dog = {
        id: uuidv4(),
        name: data.name,
        description: data.description,
        colors: data.colors,
        weight: data.weight,
        birthdate: data.birthdate,
    };

    // read what's already in the file
    fs.readFile("dogs.json", "utf8", (err, fileData) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error retrieving dogs from file");
            return;
        } else {
            const jsonData = JSON.parse(fileData);
            // check if dog already exists, by name and birthdate
            if (!jsonData[dog.id.toString()]) {
                const existingDogs: Array<Dog> = Object.values(jsonData);
                existingDogs.forEach((existingDog) => {
                    if (
                        existingDog.name === dog.name &&
                        existingDog.birthdate === dog.birthdate
                    ) {
                        res.status(500).send(
                            `Error; dog ${dog.name} with birthdate ${dog.birthdate} already exists in file`
                        );
                        return;
                    }

                    jsonData[dog.id.toString()] = dog;
                    fs.writeFile(
                        "dogs.json",
                        JSON.stringify(jsonData),
                        (err) => {
                            if (err) {
                                console.error(err);
                                res.status(500).send(
                                    "Error saving dog to file"
                                );
                                return;
                            } else {
                                res.status(200).send(
                                    "Successfully saved dog to file"
                                );
                            }
                        }
                    );
                });
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
