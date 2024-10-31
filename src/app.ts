import express, { Request, Response } from "express";
import { Dog } from "./server/models/Dog";
import { v4 as uuidv4 } from "uuid";
const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.get("/dogs", (req: Request, res: Response) => {
    res.send("This will return all dogs");
});

app.get("/dogs/:id", (req: Request, res: Response) => {
    res.send(`This will return dog with id ${req.params.id}`);
});

app.post("/dogs/", (req: Request, res: Response) => {
    const data = req.body;
    const dog: Dog = {
        id: uuidv4(),
        name: data.name,
        description: data.description,
        colors: data.colors,
        weight: data.weight,
        birthdate: data.birthdate,
    };

    res.status(200).json({
        message: `Created dog`,
        dog,
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
