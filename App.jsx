import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000';

export default function App() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/quizzes/1`)
      .then(r => r.json())
      .then(data => {
        setQuiz(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function select(questionId, option) {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  }

  async function submit(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Enter your name first.');
      return;
    }

    const response = await fetch(`${API}/api/quizzes/1/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: name,
        answers
      })
    });

    setResult(await response.json());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) return <div className="center">Loading quiz...</div>;
  if (!quiz) return <div className="center">Unable to load quiz. Is the backend running?</div>;

  return (
    <div className="app">
      <header>
        <div className="logo">☁️ CloudQuiz</div>
        <span>Cloud-Based Quiz Platform</span>
      </header>

      <main>
        {result && (
          <section className="result">
            <p>Your Result</p>
            <h2>{result.score} / {result.total_questions}</h2>
            <strong>{result.percentage}%</strong>
            <button onClick={() => window.location.reload()}>Take Again</button>
          </section>
        )}

        {!result && (
          <>
            <section className="hero">
              <p className="tag">ONLINE ASSESSMENT</p>
              <h1>{quiz.title}</h1>
              <p>{quiz.description}</p>
            </section>

            <form onSubmit={submit}>
              <section className="name-card">
                <label>Your Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </section>

              {quiz.questions.map((q, index) => (
                <section className="question" key={q.id}>
                  <h3>{index + 1}. {q.question_text}</h3>

                  {[
                    ['A', q.option_a],
                    ['B', q.option_b],
                    ['C', q.option_c],
                    ['D', q.option_d]
                  ].map(([key, value]) => (
                    <label className={answers[q.id] === key ? 'option selected' : 'option'} key={key}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[q.id] === key}
                        onChange={() => select(q.id, key)}
                      />
                      <span>{key}</span>
                      {value}
                    </label>
                  ))}
                </section>
              ))}

              <button className="submit" type="submit">Submit Quiz</button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
