import { UUIDTypes } from "uuid/dist/cjs/_types";
import { Color } from "./Utils";

export interface Dog {
    id: UUIDTypes;
    name: string;
    description: string;
    colors: Array<Color>;
    birthdate: Date;
    weight: number;
}
