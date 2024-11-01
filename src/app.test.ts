import request from "supertest";
import server from "./app";
import * as fs from "fs";

const fileName = "dogs.json";

describe("Server tests", () => {
    afterAll(async () => {
        await server.close(); // Close the server after all tests
    });

    it("should respond with Hello World!", async () => {
        const response = await request(server).get("/");

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Hello World!");
        await server.close();
    });

    // To Do - add more tests when we change to using a database, to avoid complex
    // mocking for temporary file solution

    it("should get all dogs from the file, if it exists", async () => {
        let expected = {};
        fs.readFile(fileName, "utf8", (err, data) => {
            if (err) {
                console.error(err);
            } else {
                expected = JSON.parse(data);
            }
        });
        const response = await request(server).get("/dogs");
        const data = JSON.parse(response.text);
        expect(response.statusCode).toBe(200);
        expect(data.jsonData).toStrictEqual(expected);
        await server.close();
    });
});
