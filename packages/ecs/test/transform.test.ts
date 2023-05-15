import {describe, expect, test, it} from "@jest/globals";
import {Entity} from "../src/Entity";

describe("Transform tests", () => {
    test("Generate correct model matrix", () => {
        const root = new Entity(1, "Root");
        const child = new Entity(2, "box1");
        child.transform.position.z = -10;
        root.addChild(child)
        root.Update();
        const modelMatrix = child.transform.modelMatrix;
        console.log(modelMatrix);
        expect(modelMatrix).toBe(modelMatrix);
    });
});
