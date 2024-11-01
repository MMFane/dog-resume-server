import express, { Request, Response } from "express";
import { getDogs, getDog, updateDog, createDog } from "./routeUtils";

const app = express();
const port = 3000;

app.use(express.json());

const fileName = "dogs.json";

const withFileName = (
    fileName: string,
    callback: Function,
    req: Request,
    res: Response
) => {
    return callback(fileName, req, res);
};

app.get("/", (_req: Request, res: Response) => {
    try {
        res.send("Hello World!");
    } catch (err) {
        console.log(err);
    }
});

app.get("/dogs", (req: Request, res: Response) =>
    withFileName(fileName, getDogs, req, res)
);

app.get("/dogs/:id", (req: Request, res: Response) => {
    withFileName(fileName, getDog, req, res);
});

app.patch("/dogs/:id", (req: Request, res: Response) => {
    withFileName(fileName, updateDog, req, res);
});

app.post("/dogs", (req: Request, res: Response) => {
    withFileName(fileName, createDog, req, res);
});

const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
