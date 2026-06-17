
## Project
"Korean with Madie 🌸" — a Korean language learning web app for Russian-speaking learners.
- UI language: Russian. Learning content: Korean.

## Stack & Hard Constraints
- Vanilla JS, HTML, CSS only. No frameworks, no build step, no heavy external dependencies.
- Static site (SPA), no backend server. NEVER put API keys or secrets in client code.
- Korean TTS: Web Speech API with ko-KR voice.
- Hangul stroke animations: SVG paths + stroke-dashoffset.

## App Structure
Главная (Home) · Игры (9 mini-games + K-Pop Fill) · Уроки (Хангыль — 10 lessons, Первые слова, Простые предложения) · Hangul Lab (syllable constructor with audio) · TOPIK prep · Korean holiday calendar · Общение (friends/chat) · Профиль (XP, levels, streaks, achievements, vocabulary, homework, guest/registration, admin).

## Working Principles
- Think carefully before every action. Analyze the task, plan edge cases first — write code only after.
- Never cut corners: no stubs, mocks, TODOs, or "simplified versions" without explicit permission. Deliver complete, working solutions.
- Accuracy over speed. Never assume — check the actual code first.
- After any change, verify nothing is broken: trace the logic through affected screens, fix issues fully.
- Finish the job completely. Never stop halfway.

## Quality Standards
- Every new feature must be responsive from day one (test at 375px and 768px).
- Every new feature must support the dark theme (backgrounds #121212–#1E1E1E, no pure white text, WCAG AA contrast).
- Animations: smooth and gentle — transition 200–300ms, ease-out, no abrupt movement.
- All user-facing text in Russian; Korean words always with transcription where learners need it.
- Keep consistent UI patterns: settings buttons in the same position across all blocks.

## After Every Task
- List everything that was changed.
- Flag anything that needs manual testing in the browser.