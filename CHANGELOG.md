# Changelog

# 1.0.1
## Summary
Documentation and code quality pass across the entire plugin — added inline comments to every file explaining what each section does and why, fixed a few minor issues in the code and config, and created the changelog you're reading now.

## Details
- routes.py: Added detailed comments to every section of the file:
  - Imports block now explains what each module is used for (json for serialization, FastAPI for the web framework, Request for reading the request body, JSONResponse for returning properly formatted responses)
  - Constants section documents that PLUGIN_ID must match the directory name, PLUGIN_LABEL is the human-readable name used in logs, and API is the base path that prevents route collisions between plugins
  - The setup() function now explains that the feedBack host calls it at startup, what the app and context parameters are, and that context["log"] is the server-side logger
  - The route handler documents that it's the endpoint screen.js sends its payload to, and that it's a POST route because data is sent in the request body
  - Log entry construction explains that logs go both to the server log and back to the client so the user can see the full round trip on screen
  - Request body reading explains that default=str handles objects json.dumps can't serialize normally
  - Client data extraction section documents each field the client sends (message, plugin, api, direction, destination) and what each one means
  - Response data section explains that these fields mirror the client's but flip the direction and destination to reflect the server side
  - Message validation documents the only rule (must contain "hello", case-insensitive) and notes this is the basic pattern a real plugin would follow
  - Success and error responses now have inline comments on the message and error fields explaining what they contain
  - Confirmation log at the bottom explains it runs once at plugin load time and confirms the route was registered

- screen.js: Added inline comments throughout the entire file:
  - IIFE wrapper now explains it prevents anything from leaking into the global scope except what's explicitly exposed on window, and that 'use strict' catches common JS mistakes
  - Constants section documents what each constant is for (human-readable name, directory-matching id, base API path, CSS class string for styled output blocks)
  - json_pretty() helper explains it turns objects into formatted JSON strings so log output is readable
  - log() helper documents that it builds the HTML displayed on screen after a request — stitching together three sections (what the client sent, what the server logged, what came back) each in styled <pre> blocks
  - screen_js_message() function has comments on every logical step: extracting the message from the button click data, building the request body with plugin metadata and routing info, sending the POST with fetch(), parsing the JSON response, cloning the response for display without touching the original data, handling the three possible outcomes (success, server error, bad response), and rendering everything on screen with innerHTML
  - The catch block now uses safeLogs which safely falls back to an empty array if the fetch failed before a response was received, preventing a reference error on data.logs
  - The window exposure line explains it's necessary so screen.html's onclick attribute can call the function
  - Final console.log confirms the plugin loaded successfully

- screen.html: Added comments explaining the layout and each element:
  - Main container documents it uses flexbox column layout to center everything vertically and horizontally, with min-h-[60vh] ensuring it takes up at least 60% of the viewport height
  - Button comment explains that onclick calls screen_js_message() which is defined in screen.js and exposed on window, and that it passes {action: 'clicked', message: 'Hello'} which the server validates by checking for "hello" (case-insensitive)
  - Hidden result div documents that screen.js finds it by id and sets innerHTML to show the full round-trip log, and that it starts hidden and gets revealed when a response arrives

- AGENTS.md: Updated the files table and rewrote known issues to reflect the current state:
  - plugin.json row now mentions "type" in addition to the other fields
  - README.md description updated from "Placeholder for user-facing docs" to "User-facing guide with usage instructions and key patterns to copy"
  - Known issues section corrected: the output_class hoisting concern is gone since it's now declared before the log() function that uses it, the catch block now uses safeLogs so there's no silent reference error, and the plugin.json type/category explanation was corrected to match the actual spec

- GOALS.md: Fixed several inaccuracies in the build specification:
  - Route name corrected from "message" to "routes_py_message" in both the screen.js and routes.py sections
  - Filename corrected from "route.py" to "routes.py" throughout
  - Version changed from hardcoded "1.0.0" to "1.x.x" to reflect it's a template
  - Added "type" field to the plugin properties list
  - Icon path corrected from "./assets/thumb.svg" to "./assets/thumb.png"
  - Reference path fixed from "./plugins/feedBack-plugin-spec" to "../plugins/feedBack-plugin-spec"
  - Added a Change Log section with instructions for documenting future releases

- plugin.json: Bumped version from 1.0.0 to 1.0.1, changed type from "audio" to "visualization" and category from "audio" to "testing" to better match what the plugin actually is

- Created CHANGELOG.md documenting the release history of the plugin

# 1.0.0
## Summary
Initial release of the Hello World plugin — a working example that shows developers how to send data from a plugin's browser frontend to its Python backend and get a response back. Built as a starting point for anyone creating their own feedBack plugin.

## Details
- Created plugin.json with the plugin's identity and configuration:
  - Plugin id set to "hello_world" (must match the directory name)
  - Version set to 1.0.0
  - Navigation entry added so "Hello World" shows up as a sidebar link in the app
  - Registered screen.html as the page content, screen.js as the client script, and routes.py as the server module
  - Set type to "visualization" and category to "testing"
  - Pointed icon to assets/thumb.png

- Built screen.html — the page users see when they click the Hello World link:
  - Contains a heading and short description explaining what the plugin does
  - Has a "Send Message" button that calls screen_js_message() when clicked, passing in {action: 'clicked', message: 'Hello'}
  - Includes a hidden result div where the server's response gets displayed after the request completes
  - Uses Tailwind CSS classes for layout and styling (flexbox centering, color scheme, hover effects)
  - No outer wrapper div — the host app injects this content directly into its own screen container

- Built screen.js — the client-side logic that handles the browser side of the conversation:
  - Wrapped in an IIFE so nothing leaks into the global scope except what's intentionally exposed on window
  - Defines constants for the plugin name, plugin id, and API base path (/api/plugins/hello_world)
  - Includes a json_pretty() helper that formats objects as readable JSON strings for logging
  - Includes a log() helper that builds the HTML shown on screen after a request — it stitches together three sections: what the client sent, what the server logged, and what came back, each wrapped in styled <pre> blocks
  - The main screen_js_message() function does the heavy lifting:
    - Takes the button click data, pulls out the message field
    - Builds a request body containing the message, plugin name, API path, direction ("client_to_server"), and destination info (file, function, and full route path)
    - Sends a POST request to /api/plugins/hello_world/routes_py_message using fetch()
    - Waits for the server response and parses the JSON
    - Checks three possible outcomes: success (message returned with no error), server error (error field present), or bad response (non-200 status)
    - Renders the full round-trip log on screen using innerHTML
    - Has a catch block that handles network failures gracefully — shows an error message on screen even when fetch itself fails
  - Exposes screen_js_message on the window object so the HTML button can call it
  - Logs "plugin loaded..." to the console when the script finishes loading

- Built routes.py — the server-side FastAPI route handler:
  - Exports a setup(app, context) function that the feedBack host calls when loading the plugin
  - Grabs the logger from context["log"] for all server-side output
  - Registers a POST route at /api/plugins/hello_world/routes_py_message
  - When a request comes in, it logs the route call, the context dict, and the full request body at debug level
  - Reads the JSON payload from the request and pulls out each field (message, plugin, api, direction, destination)
  - Validates the message — checks if it contains "hello" (case-insensitive)
  - On valid message: builds a success response with message "Hello World!", an empty error field, plugin metadata, the server's direction and destination info, and the full logs array so the client can display the round trip
  - On invalid message: builds an error response with message "Error", error "Invalid message", and the same metadata and logs, returned with status 400
  - Logs a confirmation message when routes are registered successfully at plugin startup

- Added assets/thumb.png as the plugin thumbnail image used in the plugin list

- Created README.md explaining what the plugin teaches and how to use it:
  - Describes the four key concepts: client-to-server communication, FastAPI route setup, screen registration, and logging on both sides
  - Lists all files with short descriptions
  - Documents the key patterns developers should copy when building their own plugin (IIFE wrapping, POST to the API path, setup() function, context["log"] usage)

- Created AGENTS.md as a reference for AI assistants working on the plugin:
  - Documents the actual API shape (what the client sends, what the server responds with)
  - Lists feedBack plugin conventions (id matching directory name, nav screen format, screen injection, IIFE pattern, route registration)
  - Notes known code details like the output_class declaration order and the safeLogs fallback in the catch block
  - Includes a verification checklist and common pitfalls

- Created GOALS.md with the original build specification that guided the plugin's development

- Added .gitignore excluding __pycache__ and .DS_Store from version control
