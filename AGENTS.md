# Hello World Plugin — Agent Guide

## What this plugin does

A feedBack plugin demonstrating client-server message transmission. The button on screen calls `window.screen_js_message()` with `{action: 'clicked', message: 'Hello'}`, which POSTs a detailed payload to `/api/plugins/hello_world/routes_py_message`. The server validates the message (checks for "hello"), logs everything with debug-level detail, and returns a structured response including the full log chain. The client renders the server's logs and response on screen using `innerHTML`.

## Files

| File | Purpose |
|---|---|
| `plugin.json` | Manifest — id `hello_world`, nav entry, screen/script/routes, category, icon |
| `screen.html` | UI with button calling `screen_js_message({action:'clicked', message:'Hello'})` and a result div |
| `screen.js` | IIFE-wrapped client; exposes `window.screen_js_message()` — builds a rich payload, POSTs to server, renders structured log output |
| `routes.py` | FastAPI `setup(app, context)` — registers POST `/api/plugins/hello_world/routes_py_message`, validates message contains "hello", returns `Hello World!` response with logs array |
| `GOALS.md` | Original build specification |
| `README.md` | Placeholder for user-facing docs |

## Actual API shape

- **Route:** `POST /api/plugins/hello_world/routes_py_message`
- **Client sends:** `{message, plugin, api, direction: "client_to_server", destination: {file, function, path}}`
- **Server validates:** `"hello"` (case-insensitive) in `message` field
- **Server responds:** `{message: "Hello World!", error: "", plugin, api, direction: "server_to_client", destination: {...}, logs: [...]}`
- **On invalid:** `{message: "Error", error: "Invalid message", ...}` with status 400
- **Client output:** Uses `innerHTML` with `<pre>` tags and `output_class` to render server logs

## Key conventions (feedBack plugin contract)

- **plugin.json id must match directory name** — `hello_world` == `hello_world/`
- **Nav screen** uses `"nav": { "label": "Hello World", "screen": "plugin-hello_world" }`
- **screen.html content is injected** directly into `<div id="plugin-hello_world" class="screen">` — no outer wrapper
- **screen.js is an IIFE** — `(function(){ 'use strict'; ... })();`
- **routes.py exports `setup(app, context)`** — receives FastAPI app and context with `config_dir`, `log`, etc.
- **API path** is `/api/plugins/<plugin_id>/<route>`
- **Logging** — server uses `context["log"]` at `debug` level
- **No build step** — vanilla JS, no npm

## Known issues / code notes

- `output_class` in `screen.js:35` is assigned **after** it's referenced in the `log()` function at line 21. At runtime, the `log()` call inside `screen_js_message()` executes after the assignment, so it works — but the hoisting mismatch could confuse static analysis.
- The `catch` block at `screen.js:88` references `data.logs` which would be undefined if the fetch itself threw — currently that reference error is silently swallowed but won't produce the expected HTML.
- `plugin.json` declares both `"category": "audio"` and `"type": "audio"` (the spec uses `type`; `category` is v3 Pedalboard metadata). This is harmless — both are optional and unknown keys are ignored.

## Verification checklist

1. Plugin loads without server errors
2. Nav entry "Hello World" appears in sidebar
3. Clicking "Send Message" POSTs to `/api/plugins/hello_world/routes_py_message`
4. Server debug-logs the request, context, payload, and validation
5. Response `message: "Hello World!"` triggers success display
6. Screen shows structured output with server logs and response
7. Browser console shows client-side log messages

## Common pitfalls

- **No outer wrapper in screen.html** — host provides the `.screen` div
- **plugin.json id must equal directory name** — `hello_world` not `hello-world` or `HelloWorld`
- **Route collisions** — always prefix with `/api/plugins/<id>/`
- **FastAPI POST routes** need `from fastapi import Request` and `async def route(request: Request)` with `await request.json()`
