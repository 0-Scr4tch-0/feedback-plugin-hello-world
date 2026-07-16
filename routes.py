"""Hello World plugin — a test transmission route that logs incoming messages and returns hello world."""

# ---- Imports ----
# json: used to serialize context and request body for logging
# FastAPI: the web framework this plugin runs on
# Request: lets us read the incoming HTTP request body
# JSONResponse: returns a proper JSON response with the right Content-Type header
import json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# ---- Constants ----
# PLUGIN_ID must match the directory name and the "id" field in plugin.json.
# PLUGIN_LABEL is the human-readable name used in log messages.
# API is the base path for all routes in this plugin. Every route gets
# registered under /api/plugins/hello_world/ so there are no collisions
# with other plugins.
PLUGIN_ID = "hello_world"
PLUGIN_LABEL = 'Hello World'
API = '/api/plugins/' + PLUGIN_ID;

# ---- Plugin entry point ----
# The feedBack host calls setup(app, context) when it loads this plugin.
#   app: the FastAPI application instance — we register routes on it
#   context: a dict with shared resources like the logger and config directory
#            context["log"] is a Python logger that writes to the app's log file
def setup(app: FastAPI, context: dict) -> None:
    log = context["log"]

    # ---- Route: POST /api/plugins/hello_world/routes_py_message ----
    # This is the endpoint that screen.js sends its payload to.
    # It's a POST route because we're sending data in the request body.
    @app.post(f"{API}/routes_py_message")
    async def routes_py_message(request: Request) -> JSONResponse:
        route = "routes_py_message"

        # ---- Build the initial log entries ----
        # These get logged to the server AND sent back to the client in the
        # response so the user can see the full round trip on screen.
        logs = [
            f"{PLUGIN_LABEL}: {route}() called via: @app.post(\"{API}/{route}\")",
            f"{PLUGIN_LABEL}: {route}() called with context: {json.dumps(context, indent=4, default=str)}"
        ]
        for log_msg in logs:
            log.debug(log_msg)

        # ---- Read the request body ----
        # This is the JSON payload that screen.js built and sent.
        # default=str handles any objects that json.dumps can't serialize normally.
        body = await request.json()
        logs.append(f"{PLUGIN_LABEL}: {route}() called with request: {json.dumps(body, indent=4, default=str)}")
        log.debug(logs[-1])

        # ---- Extract client data ----
        # Pull each field out of the request body so we can work with them
        # individually. This is what the client sent:
        #   message:    the text to validate (must contain "hello")
        #   plugin:     the plugin id that sent this request
        #   api:        the API base path of the sending plugin
        #   direction:  always "client_to_server" on the way in
        #   destination: info about where this request is headed
        arg_message = body.get("message")
        arg_plugin = body.get("plugin")
        arg_api = body.get("api")
        arg_direction = body.get("direction")
        arg_destination = body.get("destination")

        # ---- Build the response data ----
        # These fields mirror what the client sent but flip the direction
        # and destination to reflect the server side of the conversation.
        rsp_plugin = PLUGIN_ID
        rsp_api = API
        rsp_direction = "server_to_client"
        rsp_destination = dict(
            rsp_file="screen.js",
            rsp_function="screen_js_message",
        )
        rsp_destination['rsp_path'] = F"{API}/{rsp_destination['rsp_function']}"

        # ---- Validate the message ----
        # The only validation rule: the message must contain "hello" (case-insensitive).
        # This demonstrates the basic pattern a real plugin would use to validate input.
        if "hello" in arg_message.lower():
            # Valid message — build a success response
            logs.append(f"{PLUGIN_LABEL}: {route}() received valid message: \"{arg_message}\"")
            log.debug(logs[-1])
            responseDict = dict(
                message="Hello World!",  # The payload the client will display
                error="",               # Empty string means no error
                plugin=rsp_plugin,
                api=rsp_api,
                direction=rsp_direction,
                destination=rsp_destination,
                # request=body,          # Uncomment to echo the full request back
                logs=logs               # The server's log chain — client renders this on screen
            )
            response = JSONResponse(responseDict, status_code=200)
            return response
        else:
            # Invalid message — build an error response
            logs.append(f"{PLUGIN_LABEL}: {route}() received invalid message: \"{arg_message}\"")
            log.debug(logs[-1])
            responseDict = dict(
                message="Error",
                error="Invalid message",
                plugin=rsp_plugin,
                api=rsp_api,
                direction=rsp_direction,
                destination=rsp_destination,
                # request=body,
                logs=logs
            )
            response = JSONResponse(responseDict, status_code=400)
            return response

    # ---- Confirmation ----
    # This runs once when the plugin is loaded. If you see this in the log,
    # the route was registered successfully.
    log.info(f"{PLUGIN_LABEL}: routes registered")
