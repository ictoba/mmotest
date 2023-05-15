
import { World } from "./World";

const main = async () => {
    const world = new World()

    world.Init();

    await world.Run();
};

main();
