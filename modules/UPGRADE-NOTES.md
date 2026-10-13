# English Life World — Speaking Coach upgrade

## What's new
- Added `modules/speaking-coach.js` as an isolated module; existing modules and room/action data are unchanged.
- Added a speaking panel with four role-play scenarios (morning, kitchen, family chat, weekend), microphone speech recognition, editable transcript, typed fallback, text-to-speech playback, lightweight grammar/naturalness hints, and conversation history for the current session.
- The browser's native `SpeechRecognition`/`webkitSpeechRecognition` is used when available. Recognition commonly requires Chrome/Edge and microphone permission; browsers may require HTTPS or localhost.
- Added an optional AI endpoint setting. Leave it blank to keep the feature fully local with predefined dialogue. If configured, the app POSTs JSON `{ messages, scenario, level, language, task }` and accepts either JSON (`reply`, optional `correction` and `tips`) or plain-text response. The endpoint must allow browser CORS requests. Use a server-side proxy for model credentials; do not put secret API keys in this static HTML app.
- The new module's styles are namespaced with `.sc-` to avoid changing existing component styles.

## Test
Run `node modules/speaking-coach.test.cjs` to test normalization, transcript comparison, basic correction hints and local dialogue responses.

Existing data, rooms, routines, action queue, voice profiles, translation modules, reading levels and review system are retained. Browser-based legacy tests in this environment could not run because the ZIP's test scripts expect a globally installed Playwright package that is not present here.
