# Goals

This project should build a simple plugin according to the feedback-plugin-spec that incudes all minimum 
requirements and the addition of the following stages:
- screen.html: 
    1. This should contain a button that when clicked run the JS function `screen_js_message`.
- screen.js: 
    1. This should contain a function `screen_js_message` that when triggered sends a JSON dictionary to the FastAPI 
      server via ajax with the post route of `routes_py_message`
    2. The JSON dictionary should be structured as `message: `hello`
    3. The JS function should log to the console that it was clicked
- routes.py: 
    1. This should have a FastAPI post route of `routes_py_message` that receives a JSON dictionary from the JS 
      `screen_js_message` function in screen.js
    2. The server should log to the app log that a request was received
    3. The server should check that the dictionary contains key message and that the value is hello
    4. The server should then send a JSON dictionary back to the screen.js `screen_js_message` function that is formatted as 
       `message: `hello world`
- screen.js: 
    1. The `screen_js_message` function should listen for the response from the routes.py `routes_py_message` function
    2. The function should check that the response contains the key of message and has a value of `hello world`
    3. The function should then log to the console that the message was received
    4. The function should return the message value back to the screen.html
- screen.html:
    1. The results of the message should be then injected into the html and displayed on the page.

# Plugin Properties (for plugin.JSON)
Repo Name: feedback-plugin-hello-world
ID: hello_world
Version: 1.x.x
Nav Human: Hello World
Nav Link: hello_world
screen: screen.html
script: screen.js
routes: routes.py
type: audio
category: audio
icon: ./assets/thumb.png
description: A simple plugin to serves as boilerplate for plugin developers and that tests data transmission 
between client and server and logs the transmission.

# References
- ../plugins/feedBack-plugin-spec

# Change Log
## Initial Release
Review all of @root the compare all changes from the first to the last git commit of version 1.0.0. Produce a "detailed" list of all changes and prepare a change log as 1.0.0. These details should be comprehensive and "human-readable"; no AI over-the-top eloquence. Add the comments to the change log under the details section. Make sure to make a new section if this the first entry. Add a summary as well.

## New Release
Review all of @root the compare all changes from last releases git commit to the new release. Produce a "detailed" list of all changes and prepare a new section in the change log (if it does not already exist; update as needed if it already exists). These details should be comprehensive and "human-readable"; no AI over-the-top eloquence. Add the comments to the change log under the details section. Add a summary as well.
