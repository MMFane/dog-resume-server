import { Request, Response } from "express";
import { Dog } from "./server/models/Dog";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";

const sendfileRetrievalError = (err: NodeJS.ErrnoException, res: Response) => {
    console.error(err);
    res.status(500).send("Error retrieving dogs from file");
    return;
};

const sendDogNotFoundError = (id: string, res: Response) => {
    res.status(404).send(`Couldn't find dog with id ${id} in the file`);
    return;
};

const sendSaveError = (err: NodeJS.ErrnoException, res: Response) => {
    console.error(err);
    res.status(500).send("Error saving dog to file");
    return;
};

export const getDogs = (fileName: string, _req: Request, res: Response) => {
    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            sendfileRetrievalError(err, res);
        } else {
            const jsonData = JSON.parse(data);
            res.status(200).json({
                message: "Successfully retrieved dogs",
                jsonData,
            });
        }
    });
};

export const getDog = (fileName: string, req: Request, res: Response) => {
    const id = req.params.id;

    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            sendfileRetrievalError(err, res);
        } else {
            const jsonData = JSON.parse(data);
            if (!jsonData[id]) {
                sendDogNotFoundError(id, res);
            }
            res.status(200).json({
                message: `Successfully retrieved dog with id ${id}`,
                dog: jsonData[id],
            });
        }
    });
};

export const updateDog = (fileName: string, req: Request, res: Response) => {
    const id = req.params.id;

    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            sendfileRetrievalError(err, res);
        } else {
            const jsonData = JSON.parse(data);
            if (!jsonData[id]) {
                sendDogNotFoundError(id, res);
            }
            const body = req.body;

            jsonData[id] = {
                ...jsonData[id],
                ...body,
            };
            fs.writeFile(fileName, JSON.stringify(jsonData), (err) => {
                if (err) {
                    sendSaveError(err, res);
                } else {
                    res.status(200).json({
                        message: `Successfully updated dog with id ${id}`,
                        dog: jsonData[id],
                    });
                }
            });
        }
    });
};

export const createDog = (fileName: string, req: Request, res: Response) => {
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
    fs.readFile(fileName, "utf8", (err, fileData) => {
        if (err) {
            sendfileRetrievalError(err, res);
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
                    fs.writeFile(fileName, JSON.stringify(jsonData), (err) => {
                        if (err) {
                            sendSaveError(err, res);
                        } else {
                            res.status(200).send(
                                `Successfully saved dog ${dog.name} to file`
                            );
                        }
                    });
                });
            }
        }
    });
};
