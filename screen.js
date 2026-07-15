/* Hello World Plugin — screen.js
 * Sends a message to the server and displays the response.
 */
(function () {
    'use strict';

    const Plugin_Label = 'Hello World';
    const Plugin = 'hello_world';
    const API = '/api/plugins/' + Plugin;

    function json_pretty(yourObject, indent) {
        return JSON.stringify(yourObject, null, indent);
    }

    function log(log1, logs_server, dataString, message) {
        var log2 = Plugin_Label + ': screen_js_message() ' + message + ': ' + dataString;
        console.log(log2);

        // screen.js and pre routes.py
        var html = '';
        html += 'screen.js: <br><br>' + "<pre "+output_class+">" + log1 + '</pre><br>';

        // routes.py
        html += 'routes.py: <br><br>';
        logs_server.forEach(log => {
           html += "<pre "+output_class+">" + log + '</pre><br>';
        });

        // screen.js and post routes.py
        html += 'screen.js: <br><br>' + "<pre "+output_class+">" + log2 + '</pre><br>';

        return html;
    }

    const output_class = 'class="flex-1 bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50"'

    async function screen_js_message(objectData) {
        var objectString = json_pretty(objectData, 4);
        var message = objectData.message;
        var log1 = Plugin_Label + ': screen_js_message() called with object: ' + objectString;
        console.log(log1);
        try {
            var bodyObject = {};
            bodyObject.message = message;
            bodyObject.plugin = Plugin;
            bodyObject.api = API;
            bodyObject.direction = 'client_to_server';
            bodyObject.destination = {};
            bodyObject.destination.file = 'routes.py';
            bodyObject.destination.function = 'routes_py_message';
            bodyObject.destination.path = `${API}/${bodyObject.destination.function}`;

            var bodyString = JSON.stringify(bodyObject);
            var options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: bodyString
            };
            const response = await fetch(bodyObject.destination.path, options);
            const data = await response.json();
            console.log(data);

            const htmlResult = document.getElementById('hello_world-result');

            var dataString = structuredClone(data);
            dataString.response_status = response.status
            dataString.logs = "[...]";
            var dataString = json_pretty(dataString, 4);

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

        } catch (err) {
            var html = log(log1, data.logs, err, 'Error: Fetch Failed');
            htmlResult.innerHTML = html;
            htmlResult.classList.remove('hidden');
            return null;
        }
    }

    window.screen_js_message = screen_js_message;

    console.log(Plugin_Label + ': plugin loaded...');
})();
