import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/cloudquiz'
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cloudquiz' });
});

app.get('/api/quizzes', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, description FROM quizzes ORDER BY id'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await pool.query(
      'SELECT id, title, description FROM quizzes WHERE id = $1',
      [req.params.id]
    );

    const questions = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d
       FROM questions WHERE quiz_id = $1 ORDER BY id`,
      [req.params.id]
    );

    if (!quiz.rows[0]) return res.status(404).json({ error: 'Quiz not found' });

    res.json({ ...quiz.rows[0], questions: questions.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quizzes/:id/submit', async (req, res) => {
  try {
    const { student_name, answers } = req.body;

    const { rows } = await pool.query(
      'SELECT id, correct_option FROM questions WHERE quiz_id = $1 ORDER BY id',
      [req.params.id]
    );

    let score = 0;
    rows.forEach((q) => {
      if (answers?.[q.id] === q.correct_option) score++;
    });

    await pool.query(
      `INSERT INTO quiz_results
       (student_name, quiz_id, score, total_questions)
       VALUES ($1, $2, $3, $4)`,
      [student_name || 'Anonymous', req.params.id, score, rows.length]
    );

    res.json({
      score,
      total_questions: rows.length,
      percentage: rows.length ? Math.round((score / rows.length) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/results', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.id, r.student_name, q.title, r.score,
             r.total_questions, r.submitted_at
      FROM quiz_results r
      JOIN quizzes q ON q.id = r.quiz_id
      ORDER BY r.submitted_at DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`CloudQuiz API running on http://localhost:${port}`));
