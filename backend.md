## **Synopsis**

The backend implements the web app, serving up an authenticated configuration page and servicing requests to read and modify the Kiosk configuration.

## **TL;DR**

It's pretty finicky - there are a lot of moving parts to get right:

**nginx**

Add the `nginx` configuration block to `/etc/nginx/sites-available/default`

 **wsgi backend**
 
`cp backend/Kiosks.json /var/www/html`
(if needed) `mkdir ~/bin`
`cp backend/kiosks_wsgi.* ~/bin`
`chmod +x ~/bin/kiosks_wsgi.py`
`sudo (cd /etc/systemd/sites-available; ln -s /home/stfyc/bin/kiosks_wsgi.service .)`
`mkdir /var/www/html/Kiosks`
`cp frontend/* /var/www/html/Kiosks`

**Daemon Restart**

`sudo systemctl demon-reload`
`sudo systemctl enable kiosks_wsgi`
`systemctl start kiosks_wsgi`
`sudo systemctl restart nginx`
 
**Test**

Check that the backend is running `sudo systemctl status kiosks_wsgi`
Create a user with `sudo htpasswd -c /etc/nginx/stfycusers.txt <user>`
Browse to `http://<host>/Kiosks/kiosks.html`

## **Configuring nginx**

The Kiosk endpoint is behind http auth_basic and interacting with the configuration is implemented in a Python script using `wsgiref`, a reference implementation of the WSGI protocol. When looking for more information do not be distracted by uWSGI or other WSGI implementations - there's a lot of irrelevant information out there.

The nginx configuration block is:

    # From a Stack Overflow post - enable richer debugging
    # error_log /var/log/nginx/error.log debug;
    # Also useful - sudo strace -f -e trace=file -p $(pidof kiosks_wsgi,py)

    # An auth_basic protected directory that passes requests to <host>/display/wsgi
    # through to a wsgi server
    location /Kiosks/ {
	 auth_basic "Kiosk URL Configuration";
	 auth_basic_user_file "/etc/nginx/stfycusers.txt";

	 location /Kiosks/wsgi {
	     proxy_pass http://127.0.0.1:8000/;
	     proxy_set_header Host $host;
       	     proxy_set_header X-Real-IP $remote_addr;
       	     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       	     proxy_set_header X-Forwarded-Proto $scheme;
	 }
    }

## **The WSGI backend**

The WSGI backend `kiosks_wsgi.py` should be copied to `~/bin` and made executable. It is both the WSGI server and the WSGI application, currently implementing the Kiosk web page interface and the bridge to the scrollheight backend.

## **Configuring auth_basic**

To keep random users from reconfiguring the kiosks the frontend URL is in an access-controlled directory /var/www/html/Kiosks/. \
Currently access control is auth_basic as specified in the nginx configuration. auth_basic uses simple username:password mapping stored in /etc/nginx/stfycusers.txt.

`sudo apt-get install apache2-utils`

The password file is manipulated with `htpasswd`; typical use is

`sudo htpasswd -c /etc/nginx/stfycusers.txt <user>`

## ** Configuring npm for puppeteer **

To determine the frame height of a results page to implement scrolling we use
*puppeteer*, a node.js module for orchestrating Chrome/Firefox DOM nodes.

`sudo apt-get install npm`
`(cd ~/bin; npm i puppeteer puppeteer-core)`
