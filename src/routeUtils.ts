import { Request, Response } from "express";
import { Dog } from "./server/models/Dog";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";

const sendfileRetrievalError = (err: NodeJS.ErrnoException, res: Response) => {
    console.error(err);
    res.status(500).send("Error retrieving dogs from file");
};

const sendDogNotFoundError = (id: string, res: Response) => {
    res.status(404).send(`Couldn't find dog with id ${id} in the file`);
};

const sendSaveError = (err: NodeJS.ErrnoException, res: Response) => {
    console.error(err);
    res.status(500).send("Error saving dog to file");
};

const sendEmptyFileError = (res: Response) => {
    res.status(500).send("File is empty");
};

export const getDogs = (fileName: string, _req: Request, res: Response) => {
    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            sendfileRetrievalError(err, res);
            return;
        }
        if (data.length === 0) {
            sendEmptyFileError(res);
            return;
        }
        const jsonData = JSON.parse(data);
        res.status(200).json({
            message: "Successfully retrieved dogs",
            jsonData,
        });
    });
};

export const getDog = (fileName: string, req: Request, res: Response) => {
    const id = req.params.id;

    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            sendfileRetrievalError(err, res);
            return;
        }
        if (data.length === 0) {
            sendEmptyFileError(res);
            return;
        }
        const jsonData = JSON.parse(data);
        if (!jsonData[id]) {
            sendDogNotFoundError(id, res);
            return;
        }
        res.status(200).json({
            message: `Successfully retrieved dog with id ${id}`,
            dog: jsonData[id],
        });
    });
};

export const updateDog = (fileName: string, req: Request, res: Response) => {
    const id = req.params.id;

    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            sendfileRetrievalError(err, res);
            return;
        }
        if (data.length === 0) {
            sendEmptyFileError(res);
            return;
        }

        const jsonData = JSON.parse(data);
        if (!jsonData[id]) {
            sendDogNotFoundError(id, res);
            return;
        }
        const body = req.body;

        jsonData[id] = {
            ...jsonData[id],
            ...body,
        };
        fs.writeFile(fileName, JSON.stringify(jsonData), (err) => {
            if (err) {
                sendSaveError(err, res);
                return;
            }
            res.status(200).json({
                message: `Successfully updated dog with id ${id}`,
                dog: jsonData[id],
            });
        });
    });
};

const createDog = (
    fileName: string,
    dog: Dog,
    res: Response,
    existingData?: { [key: string]: Dog }
) => {
    let output: { [key: string]: Dog } = {};
    if (!existingData) {
        output[dog.id.toString()] = dog;
    } else {
        output = Object.assign(existingData);
        output[dog.id.toString()] = dog;
    }
    fs.writeFile(fileName, JSON.stringify(output), (err) => {
        if (err) {
            sendSaveError(err, res);
            return;
        }
        res.status(200).send(`Successfully saved dog ${dog.name} to file`);
        res.status(201).send(`Successfully saved dog ${dog.name} to file`);
    });
};

export const postDog = (fileName: string, req: Request, res: Response) => {
    const body = req.body;
    const dog: Dog = {
        id: uuidv4(),
        name: body.name,
        description: body.description,
        colors: body.colors,
        weight: body.weight,
        birthdate: body.birthdate,
    };

    // read what's already in the file
    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            sendfileRetrievalError(err, res);
            return;
        }
        if (data.length === 0) {
            createDog(fileName, dog, res);
            return;
        }

        const jsonData = JSON.parse(data);
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
                } else {
                    createDog(fileName, dog, res, jsonData);
                    return;
                }
            });
        } else {
            res.status(500).send(
                `Error; dog with id ${dog.id.toString()} already exists`
            );
            return;
        }
    });
};
