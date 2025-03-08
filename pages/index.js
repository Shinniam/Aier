import { useState } from "react";

export default function MathSolver() {
  const [equation, setEquation] = useState("");
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState(null);

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
  );
}
