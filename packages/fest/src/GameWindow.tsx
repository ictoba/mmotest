import {useEffect, useRef, useState} from "react";
import "./App.css";
import {Game, KeyCodes} from "./rendering/Game";

const GameWindow = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [game, setGame] = useState<Game | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const game = new Game();
            game.Init(canvasRef.current);

            const ws = new WebSocket("ws://localhost:9001");
            ws.addEventListener("open", (event) => {
                console.log(`on open event type: ${event.type}`);
                game.Network.OnInit(ws);
            });

            ws.addEventListener("message", async (event: MessageEvent<Blob>) => {
                const buff = await event.data.arrayBuffer();
                game.Network.OnPacketReceived(buff);
            });

            window.addEventListener("keypress", (ev) => {
                const key = ev.key.toUpperCase();
                if (Object.values<string>(KeyCodes).includes(key)) {
                    game.Input.SetKeyPressed(key as KeyCodes);
                }
            });

            let frameId = -1;
            let timeStart = performance.now();
            const update = (time: DOMHighResTimeStamp) => {
                const deltaTime = time - timeStart;
                timeStart = time;

                game.Update(deltaTime);

                game.Render();
                frameId = requestAnimationFrame(update);
            };
            requestAnimationFrame(update);

            setGame(game);

            return () => {
                cancelAnimationFrame(frameId);
            };
        }
    }, []);

    return (
        <>
            <div className="card">
                <button
                    onClick={() => {
                        if (game) {
                            game.Network.SendServerCommand("spawn");
                        }
                    }}
                >
                    SPAWN
                </button>
            </div>
            <canvas ref={canvasRef} id="glcanvas" width="1280" height="720"></canvas>
        </>
    );
};

export default GameWindow;
