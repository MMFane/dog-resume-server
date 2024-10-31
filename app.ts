import express, { Request, Response } from "express";
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
    console.log(data);
    res.status(200).json({
        message: `This will create a dog with the following data`,
        data,
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
