INSERT INTO quizzes (title, description)
VALUES ('Cloud Computing Basics', 'Test your knowledge of fundamental cloud computing concepts.')
ON CONFLICT DO NOTHING;

INSERT INTO questions
(quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option)
SELECT q.id, x.question_text, x.a, x.b, x.c, x.d, x.correct
FROM quizzes q
CROSS JOIN (VALUES
('Which service model provides virtual machines over the internet?', 'IaaS', 'SaaS', 'PaaS', 'DBaaS', 'A'),
('Which technology allows applications to run in isolated environments?', 'Containers', 'Compilers', 'Text editors', 'Loaders', 'A'),
('What does AWS stand for?', 'Amazon Web Services', 'Advanced Web System', 'Application Web Server', 'Amazon Wide Storage', 'A'),
('Which database is used by this project?', 'MongoDB', 'PostgreSQL', 'Redis', 'SQLite', 'B'),
('What is cloud elasticity?', 'Changing resources based on demand', 'Encrypting passwords', 'Deleting servers', 'Writing frontend code', 'A')
) AS x(question_text,a,b,c,d,correct)
WHERE q.title = 'Cloud Computing Basics'
AND NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id = q.id);
