"""Hello World plugin — a test transmission route that logs incoming messages and returns hello world."""

import json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

PLUGIN_ID = "hello_world"
PLUGIN_LABEL = 'Hello World'
API = '/api/plugins/' + PLUGIN_ID;

def setup(app: FastAPI, context: dict) -> None:
    log = context["log"]

    @app.post(f"{API}/routes_py_message")
    async def routes_py_message(request: Request) -> JSONResponse:
        route = "routes_py_message"
        logs = [
            f"{PLUGIN_LABEL}: {route}() called via: @app.post(\"{API}/{route}\")",
            f"{PLUGIN_LABEL}: {route}() called with context: {json.dumps(context, indent=4, default=str)}"
        ]
        for log_msg in logs:
            log.debug(log_msg)

        body = await request.json()
        logs.append(f"{PLUGIN_LABEL}: {route}() called with request: {json.dumps(body, indent=4, default=str)}")
        log.debug(logs[-1])

        # Client Data
        arg_message = body.get("message")
        arg_plugin = body.get("plugin")
        arg_api = body.get("api")
        arg_direction = body.get("direction")
        arg_destination = body.get("destination")

        # Response Data

        rsp_plugin = PLUGIN_ID
        rsp_api = API
        rsp_direction = "server_to_client"
        rsp_destination = dict(
            rsp_file="screen.js",
            rsp_function="screen_js_message",
        )
        rsp_destination['rsp_path'] = F"{API}/{rsp_destination['rsp_function']}"

        if "hello" in arg_message.lower():
            logs.append(f"{PLUGIN_LABEL}: {route}() received valid message: \"{arg_message}\"")
            log.debug(logs[-1])
            responseDict = dict(
                message="Hello World!",
                error="",
                plugin=rsp_plugin,
                api=rsp_api,
                direction=rsp_direction,
                destination=rsp_destination,
                # request=body,
                logs=logs
            )
            response = JSONResponse(responseDict, status_code=200)
            return response
        else:
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

    log.info(f"{PLUGIN_LABEL}: routes registered")
