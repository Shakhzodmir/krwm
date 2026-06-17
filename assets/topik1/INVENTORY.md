# TOPIK I — что уже собрано

Обновлено: 2026-06-05

## 📄 Прошлые реальные тесты (past-papers/) — 9 тестов, 54 файла, ~461 MB
Источник: topikguide.com (официальные 기출문제 NIIED).
Тесты: **41, 47, 52, 60, 64, 83, 91, 96, 102**.

Каждый тест (папка `past-papers/<NN>/`) содержит 6 файлов:
- `…-Reading-Test-Paper.pdf` — вопросы 읽기 (40 вопросов)
- `…-Reading-Answers.pdf` — ключи 읽기
- `…-Listening-Test-Paper.pdf` — вопросы 듣기 (30 вопросов)
- `…-Listening-Answers.pdf` — ключи 듣기
- `…-Listening-Audio-File.mp3/.m4a` — аудио аудирования
- `…-Listening-Transcript.pdf` — скрипт аудио

> Аудио тестов 64 и 83 — в контейнере MP4 (`.m4a`), играют нормально.

## 📚 Лексика (vocab/) — 5 списков
Источник: koreanlearners.com. Формат: 한글 · перевод · пример (한글) · перевод примера.
Текст извлечён в `vocab/_text/*.txt` (готов для использования в коде).

| Файл | Содержание |
|------|-----------|
| `500 Most Used Beginner Level Words In Korean` | 500 базовых слов, разбито по секциям (существительные, местоимения, …) |
| `100 Most Common Verbs In Korean` | 100 частых глаголов + примеры |
| `100 Most Common Adjactives In Korean` | 100 частых прилагательных + примеры |
| `50 Most Common Intermediate Verbs In Korean` | 50 глаголов среднего уровня |
| `50 Most Common Intermediate Adjactives In Korean` | 50 прилагательных среднего уровня |

## 🔤 Грамматика (grammar/)
Источник: learning-korean.com (проверенный список).
- `TOPIK-I-Grammar-84-learning-korean.pdf` — **84 конструкции** уровня 1–2
  (한글 · English · 예문). Текст извлечён в `grammar/_text/TOPIK-I-Grammar-84.txt`.

## 🅰️ Алфавит (alphabet/) — фирменный «Korean with Madie»
На основе твоих прописей `Korean Alphabet Worksheet Phase1.pdf`, сделана чистая версия:
- `alphabet/hangul.json` — структурные данные: 14 자음 + 10 모음 + 5 쌍자음.
  Поля: char, name_ko, name_ru, sound, romaja, example (слово + перевод).
  Доработка: добавлены латинская транскрипция и слово-пример на каждую букву.
- `alphabet/index.html` — чистая фирменная визуальная версия (печать / в PDF).
- Исходник: `Korean Alphabet Worksheet Phase1.pdf` (+ `.txt`).

## 🔜 Чего пока нет (можно докинуть)
- `writing/` — правила 쓰기 기초 (맞춤법 орфография, 띄어쓰기 интервалы, стиль).
  Примечание: в TOPIK I раздела письма нет — это основа-мостик к TOPIK II.
- отдельные `listening/` / `reading/` подборки (сейчас всё внутри past-papers/)

См. также: `SOURCES.md` (ссылки), `README.md` (правила папки).
