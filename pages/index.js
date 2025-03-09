import { useState, useEffect, useRef } from "react";

export default function MathSolver() {
  const [equation, setEquation] = useState("");
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState(null);
  const [isTraining, setIsTraining] = useState(true);
  const [currentChar, setCurrentChar] = useState("1");
  const [charSamples, setCharSamples] = useState({});
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const characters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "x", "y", "z", "a", "b", "c", "d", "e", "i", "√"];

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d");
    }
  }, []);

  const handleDraw = (event) => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, 4, 4);
  };

  const saveCharacter = () => {
    const imageData = canvasRef.current.toDataURL();
    setCharSamples((prev) => ({ ...prev, [currentChar]: [...(prev[currentChar] || []), imageData] }));
    clearCanvas();
    const nextIndex = characters.indexOf(currentChar) + 1;
    if (nextIndex < characters.length) {
      setCurrentChar(characters[nextIndex]);
    } else {
      setIsTraining(false);
    }
  };

  const clearCanvas = () => {
    if (ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const solveEquation = async () => {
    setError(null);
    setSolution(null);
    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equation }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSolution(data.solutions);
      }
    } catch (err) {
      setError("サーバーとの通信に失敗しました。");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      {isTraining ? (
        <div className="text-center">
          <h1 className="text-xl font-bold">手書き学習: {currentChar}</h1>
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="border"
            onMouseMove={(e) => e.buttons === 1 && handleDraw(e)}
          />
          <div className="flex space-x-4 mt-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={saveCharacter}>
              保存
            </button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={clearCanvas}>
              クリア
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold">数式を解く</h1>
          <input
            type="text"
            className="p-2 border rounded w-64"
            placeholder="例: x^2 - 4 = 0"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={solveEquation}
          >
            解く
          </button>
          {solution && <p className="text-green-600">解: {solution}</p>}
          {error && <p className="text-red-600">エラー: {error}</p>}
        </div>
      )}
    </div>
  );
}
