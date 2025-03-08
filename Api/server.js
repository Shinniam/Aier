const express = require('express');
const bodyParser = require('body-parser');
const { createWorker } = require('tesseract.js');
const nerdamer = require('nerdamer/all');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));

/**
 * nerdamer を使って、簡単な一変数方程式の解を求める関数
 * 例: "x^2-4=0" → "2,-2" のような文字列で返す
 */
async function solveEquation(equation) {
  try {
    let solutions = nerdamer.solve(equation, 'x');
    return solutions.toString();
  } catch (err) {
    return `Error: ${err}`;
  }
}

/**
 * POST /api/solve
 * JSON ボディに "equation" または "image" (Base64文字列) を期待
 */
app.post('/api/solve', async (req, res) => {
  try {
    if (req.body.equation) {
      const eq = req.body.equation;
      const solutions = await solveEquation(eq);
      res.json({ equation: eq, solutions });
      return;
    } else if (req.body.image) {
      const base64Data = req.body.image.replace(/^data:image\/\\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const worker = createWorker();
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(buffer);
      await worker.terminate();

      const lines = text.split('\n');
      let equationLine = lines.find(line => line.includes('='));
      if (!equationLine) {
        res.status(400).json({ error: '画像から数式が検出されませんでした。' });
        return;
      }
      const solutions = await solveEquation(equationLine.trim());
      res.json({ extracted_text: text, equation: equationLine.trim(), solutions });
      return;
    } else {
      res.status(400).json({ error: "有効な入力がありません。JSON ボディに 'equation' または 'image' キーを含めてください。" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
