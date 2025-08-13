## **Configuring Web Kiosks**

This system implements remote configuration of simple web kiosks that at boot run Firefox in -kiosk mode (full-screen, no mouse keyboard or mouse input) pointed at a URL designated by this system.

Kiosks are assigned *roles* and each *role* is assigned a *scene*. *Scenes* are assigned a *URL*. The intent is that there might be many kiosks serving the same role; changing scene for that role or changing the URL for that role's scene changes all of them simultaneously - or each kiosk can have a role and be managed individually.

## **On the Surface It's Easy**

When descirbing what sounds like a simple problem, anyone that says *Can't you just...* hasn't thought about all requirements. Here are a few for this application:

*Backend*

- No hand-edited files, no CLI - our staff require nothing more than a few clicks and some cut & paste
- No fancy database - this is for less than a dozen kiosks (though it would work for more)
- Authenticated admin access - can't have the *hoi polloi* changing displays to their favorite URL
- Configuration via a webapp - no custom apps and the compatibility issues they bring on

*Kiosk*

- Hands-free operation - no keyboard or mouse access to the kiosks
- Resiliency - only failure remediation is reboot

To meet these needs:

The user interface is an authentication-protected web page running on a backend server. The server maintains a JSON configuration file in public space and a management app (web page) in a protected space. There is a WSGI-based service that manages the configuration file.

Each kiosk is configured to start `firefox` at boot and runs a monitoring daemon that restarts Firefox if the URL for the kiosk's role changes. `firefox` was chosen for its good kiosk mode, efficiency (memory and cpu) and and overall reliability.

There are several little moving parts to make this work end-to-end. Among the items configured are `systemd`, `nginx`, `web auth`, autostart, and `cron`.

Details for the [backend](backend.md) install and configuration (w/ webapp frontend).

Details for the [kiosk](kiosk.md) install and configuration.


