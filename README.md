# Hello World Plugin

A boilerplate feedBack plugin designed to give developers a starting point for building their own plugins. This plugin demonstrates the fundamental pattern for client-server communication — showing how to send data from the browser to the Python backend and receive a structured response.

If you're building a new feedBack plugin, copy this directory, rename it, and update the `id` in `plugin.json` to match. From there you can extend the client and server logic to suit your needs.

## What This Plugin Teaches

- **How a plugin's frontend talks to its backend** — `screen.js` builds a payload and POSTs it to a route defined in `routes.py`. This is the core pattern every plugin with a server component follows.
- **FastAPI route setup** — `routes.py` exports a `setup(app, context)` function that registers endpoints under `/api/plugins/<plugin_id>/`. The `context` dict gives you access to logging, the config directory, and other server utilities.
- **How to register a screen** — `plugin.json` declares a `nav` entry that adds a sidebar link, and `screen.html` provides the page content that gets injected into the app.
- **Logging on both sides** — the client logs to the browser console; the server uses `context["log"]` for structured logging. Both sides print what they send and receive so you can trace the full round trip.

## Usage

1. Click **Send Message** on the Hello World screen
2. The client sends a structured payload to the server
3. The server validates the message and returns a response with a log chain
4. The client renders the entire transaction on screen

## Files

| File | Description |
|---|---|
| `plugin.json` | Plugin manifest — declares the plugin id, nav entry, screen, script, and routes |
| `screen.html` | Screen UI with a call-to-action button |
| `screen.js` | Client-side logic — builds the payload, POSTs to the server, renders the response |
| `routes.py` | Server-side FastAPI route handler — validates input, returns a structured response |
| `GOALS.md` | Original build specification / development reference |
| `AGENTS.md` | Agent/AI assistance guide with code notes and conventions |

## Key Patterns to Copy

**Client (`screen.js`):**
- Wraps everything in an IIFE: `(function () { 'use strict'; ... })();`
- POSTs JSON to `/api/plugins/hello_world/<route_name>`
- Renders the server response in the DOM

**Server (`routes.py`):**
- Exports `setup(app, context)` — the plugin loader calls this at startup
- Registers a POST route on the FastAPI `app` object
- Uses `context["log"]` for all output (never `print()`)
- Reads the request body with `await request.json()` and returns a JSON response

**Manifest (`plugin.json`):**
- `id` must match the directory name exactly
- `nav` adds a sidebar entry with a label and screen id
- `screen` points to the HTML file to inject
- `script` points to the JS file to load
- `routes` points to the Python module containing `setup()`
