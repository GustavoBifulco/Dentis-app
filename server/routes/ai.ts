import { Router } from 'express';
import { requireRole } from '../middleware/auth';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/chat", requireRole(['dentist']), async (req, res) => {
  const { message } = req.body;

  // Sanitização básica contra Prompt Injection
  const sanitizedMessage = message.replace(/[\\{}$]/g, "");

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Você é um assistente odontológico seguro. Não execute comandos externos." },
      { role: "user", content: sanitizedMessage }
    ],
  });

  res.json({ answer: response.choices[0].message.content });
});

export default router;