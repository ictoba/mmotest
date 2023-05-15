import {useState} from "react";
import "./App.css";
import GameWindow from "./GameWindow";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <GameWindow />
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
            </div>
        </>
    );
}

export default App;
