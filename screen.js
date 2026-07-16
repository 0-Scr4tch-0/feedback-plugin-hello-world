/* Hello World Plugin — screen.js
 * Sends a message to the server and displays the response.
 */

// IIFE (Immediately Invoked Function Expression) — this wraps the entire plugin so
// nothing leaks into the global scope except what we explicitly expose on window.
// The 'use strict' flag catches common JS mistakes and disables sloppy-mode behavior.
(function () {
    'use strict';

    // ---- Constants ----
    // These stay the same for the life of the plugin. They're used to build
    // API paths and log messages so we don't have magic strings scattered around.
    const Plugin_Label = 'Hello World';    // Human-readable name for log output
    const Plugin = 'hello_world';          // Matches the directory name and plugin.json id
    const API = '/api/plugins/' + Plugin;  // Base API path: /api/plugins/hello_world
    // CSS class string applied to every <pre> block in the rendered output.
    // This gives the log sections a dark background, rounded corners, and consistent
    // styling. It's declared here so the log() function can reference it.
    const output_class = 'class="flex-1 bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50"'

    // ---- Helper: json_pretty ----
    // Turns any JS object into a formatted JSON string. Used to make log output
    // and debug info readable instead of one long unreadable line.
    function json_pretty(yourObject, indent) {
        return JSON.stringify(yourObject, null, indent);
    }

    // ---- Helper: log ----
    // Builds the HTML that gets displayed on screen after a request completes.
    // It stitches together three parts:
    //   1. What screen.js did BEFORE calling the server (log1 — the request payload)
    //   2. What routes.py logged on the server side (logs_server — array of log strings)
    //   3. What screen.js did AFTER getting the response back (log2 — the result)
    // Each section is wrapped in a <pre> tag with output_class styling so it looks
    // like a code block. The whole thing is returned as an HTML string that gets
    // injected into the page via innerHTML.
    function log(log1, logs_server, dataString, message) {
        // Build the console log line — this goes to the browser's dev console
        var log2 = Plugin_Label + ': screen_js_message() ' + message + ': ' + dataString;
        console.log(log2);

        // Section 1: what screen.js sent (the request side)
        var html = '';
        html += 'screen.js: <br><br>' + "<pre "+output_class+">" + log1 + '</pre><br>';

        // Section 2: what the server logged (each entry from the logs array)
        html += 'routes.py: <br><br>';
        logs_server.forEach(log => {
           html += "<pre "+output_class+">" + log + '</pre><br>';
        });

        // Section 3: what screen.js did after receiving the response (the result side)
        html += 'screen.js: <br><br>' + "<pre "+output_class+">" + log2 + '</pre><br>';

        return html;
    }

    // ---- Main function: screen_js_message ----
    // This is the function that screen.html calls when you click the button.
    // It builds a payload, sends it to the server, handles the response, and
    // renders everything on screen. It's async because it uses fetch (which
    // returns a promise).
    async function screen_js_message(objectData) {
        // Turn the input object into a formatted string for logging
        var objectString = json_pretty(objectData, 4);
        // Pull out the message field — this is what the server validates
        var message = objectData.message;

        // Build the first log entry: what we received from the button click
        var log1 = Plugin_Label + ': screen_js_message() called with object: ' + objectString;
        console.log(log1);
        try {
            // ---- Build the request body ----
            // This is the payload that gets sent to routes.py. It includes the
            // message, plugin metadata, and routing info so the server knows
            // where the request came from and where to send the response.
            var bodyObject = {};
            bodyObject.message = message;
            bodyObject.plugin = Plugin;
            bodyObject.api = API;
            bodyObject.direction = 'client_to_server';
            bodyObject.destination = {};
            bodyObject.destination.file = 'routes.py';
            bodyObject.destination.function = 'routes_py_message';
            bodyObject.destination.path = `${API}/${bodyObject.destination.function}`;

            // ---- Send the request ----
            // fetch() sends an HTTP POST to the server route.
            // await pauses here until the server responds.
            var bodyString = JSON.stringify(bodyObject);
            var options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: bodyString
            };
            // Parse the server's JSON response into a JS object
            const response = await fetch(bodyObject.destination.path, options);
            const data = await response.json();
            console.log(data);  // Log the full server response to the browser console

            // ---- Prepare the display string ----
            // We clone the response so we can modify it for display without
            // touching the original data. We replace the logs array with "[...]"
            // to keep the display compact — the actual logs are rendered
            // separately by the log() function.
            const htmlResult = document.getElementById('hello_world-result');

            var dataString = structuredClone(data);
            dataString.response_status = response.status
            dataString.logs = "[...]";
            var dataString = json_pretty(dataString, 4);  // Turn it into readable JSON

            // ---- Handle the response ----
            // Three possible outcomes:
            //   1. Server returned 200 with a valid message → show success
            //   2. Server returned 200 but with an error field → show server error
            //   3. Server returned non-200 status → show bad response message
            if (response.ok) {
                if (data.message !== '' && data.error === '') {
                    var html = log(log1, data.logs, dataString, 'Message received from server');
                    htmlResult.innerHTML = html;
                } else if (data.error !== '') {
                    var html = log(log1, data.logs, dataString, 'Error received from server');
                    htmlResult.innerHTML = html;
                } else {
                    var html = log(log1, data.logs, dataString, 'Unknown issue received from server');
                    htmlResult.innerHTML = html;
                }
            } else {
                var html = log(log1, data.logs, dataString, 'Bad response received from server');
                htmlResult.innerHTML = html;
            }
            htmlResult.classList.remove('hidden');
            return data;

        // ---- Error handler ----
        // If fetch() itself throws (network down, server unreachable, etc.)
        // we still want to show something useful on screen. safeLogs guards
        // against the case where `data` was never assigned (fetch failed
        // before we got a response).
        } catch (err) {
            var safeLogs = (typeof data !== 'undefined' && Array.isArray(data.logs)) ? data.logs : [];
            var html = log(log1, safeLogs, err, 'Error: Fetch Failed');
            htmlResult.innerHTML = html;
            htmlResult.classList.remove('hidden');
            return null;
        }
    }

    // Expose screen_js_message on the window object so screen.html's onclick
    // attribute can call it. Without this, the function would be stuck inside
    // the IIFE and invisible to the HTML.
    window.screen_js_message = screen_js_message;

    // Log once when the plugin finishes loading — confirms the JS file ran
    console.log(Plugin_Label + ': plugin loaded...');
})();
