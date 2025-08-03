## **Configuring Web Kiosks**

This system implements remote configuration of simple web kiosks that at boot run Firefox in -kiosk mode (full-screen, no mouse keyboard or mouse input) pointed at a URL designated by this system.

Kiosks are assigned *roles* and each *role* is assigned a *scene*. *Scenes* are assigned a *URL*. The intent is that there might be many kiosks serving the same role; changing scene for that role or changing the URL for that role's scene changes all of them simultaneously - or each kiosk can have a role and be managed individually.

The interface is an authentication-protected web page running on a backend server. The server maintains a JSON configuration file in public space and a management app (web page) in protected space.

Each kiosk is configured to run Firefox at boot and runs a monitoring daemon that restarts Firefox if the URL for the kiosk's role changes.

Details for the [backend](backend.md) install and configuration.

Details for the [kiosk](kiosk.md) install and configuration.


