#!/usr/bin/python
import wsgiref
import wsgiref.validate
from wsgiref.simple_server import make_server
import json
import urllib
import logging
import pprint

kioskConfig = "/home/stfyc/www/html/Kiosks.json"

port = 8000

"""
# Sample kiosks definition
kiosks = {
    "Scenes": {
        "Default": "http://10.0.0.22/wx.html?kiosk=1",
        "Weather": "http://10.0.0.22/wx.html?kiosk=1",
        "Weather-Test": "http://10.0.0.22/wx2.html?kiosk=1",
        "AIS": "http://10.0.0.22/ais.html?aissources=all&aischart=watercolor",
        "Results": "",
        "Protests": "",
        "Courses": "",
        "Weather-External": "https://wx.stfyc-wx.com/wx.html?kiosk=1",
        "AIS-External": "http://wx.stfyc-wx.com/ais.html?aissources=all&aischart=watercolor",
        "Weather-External-Test": "https://wx.stfyc-wx.com/wx2.html?kiosk=1",
        "Reset": "https://www.stfyc.com",
        "Test": "",
    },
    "Roles": {
        "Grill Room": "Weather",
        "Race Office": "Weather",
        "Jury Desk": "AIS",
        "Breezeway": "Weather",
        "Test Kiosk": "AIS-External",
    }
}
"""

def application(environ, start_response):
    """
    A simple WSGI application that returns the kiosks collection in a JSON-encoded string.
    """

    # Reread the config file in case it's been manually edited
    with open(kioskConfig, "r") as f:
        # the pretty printer uses single quotes, JSON requires double quotes
        single = f.read()
        double = single.replace("'", '"')
        kiosks = json.loads(double)

    req = wsgiref.util.request_uri(environ)

    """
    for key, value in environ.items():
        print("env %8s: %s" % (key, environ[key]))
    """

    dreq = urllib.parse.unquote(req)
    p = urllib.parse.urlparse(dreq)
    print("parsed request: %r" % (p,))
    q = urllib.parse.parse_qs(p.query)
    print("query: %r" % (q,))


    if ("changeRole" in q) and ("Scene" in q):
        changingRole = q["changeRole"][0];
        newScene = q["Scene"][0];
        if (changingRole in kiosks["Roles"]) and (newScene in kiosks["Scenes"]):
            print("Changing role '%r' to '%r'" % (changingRole, newScene))
            kiosks["Roles"][changingRole] = newScene;
        else:
            print("Couldn't change Role %r to %r" % (changingRole, newScene))
    else:
        print('"changeRole" in q: %r "Scene" in q: %r' % ("changeRole" in q, "Scene" in q))
        
    if ("changeScene" in q) and ("URL" in q):
        changingScene = q["changeScene"][0];
        newURL = q["URL"][0].strip();
        if changingScene in kiosks["Scenes"]:
            print("Changing Scene %r to %r" % (changingScene, newURL))
            kiosks["Scenes"][changingScene] = newURL;
        else:
            print("Couldn't change Scene '%s' to '%s'" % (changingScene, URL))
    else:
        print('"changeScene" in q: %r "URL" in q: %r' % ("changeScene" in q, "URL" in q))

    with open(kioskConfig, "w") as f:
        pprint.pp(kiosks, f)

    #print("Serializing %r" % (kiosks))
    ret = bytes(json.dumps(kiosks), "utf-8")

    #print("ret: %r" % (ret))

    # debugging - return environment with kiosks and the request uri
    #ret["uri"] = wsgiref.util.request_uri(environ)
    #ret["environ"] = {}
    #for key, value in environ.items():
    #    ret["environ"][key] = value.encode("utf-8")

    status = '200 OK'  # HTTP Status Code and message
    #headers = [('Content-type', 'text/plain')]  # HTTP Response Headers
    headers = [('Content-type', 'application/json'),
               ('Content-Length', str(len(ret)))]  # HTTP Response Headers
    
    # Call the start_response function to send headers
    start_response(status, headers)
    
    # Return an iterable of bytes representing the response body
    # Always return the current kiosks
    return [ ret ]

if __name__ == '__main__':
    """
    with open(kioskConfig, "r") as f:
        # the pretty printer uses single quotes, JSON requires double quotes
        single = f.read()
        double = single.replace("'", '"')
        kiosks = json.loads(double)

    # Create a WSGI server instance
    # Serve requests forever until interrupted
    #with make_server('127.0.0.1', port, application) as httpd:

    print("Initial kiosks %r" % (kiosks))
    """

    logging.basicConfig(format='%(asctime)s %(message)s', datefmt='%Y-%m-%d %H:%M:%S', level=logging.DEBUG)

    # Using the validator isn't strictly necessary and is a little slower, but so what?
    vapp = wsgiref.validate.validator(application)
    
    with make_server('127.0.0.1', port, vapp) as httpd:
        print("Serving kiosks on port %d" % (port))
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("Shutting down.")
            httpd.server_close()
