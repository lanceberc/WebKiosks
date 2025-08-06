## **Kiosk Configuration**

Configuring each kiosk had parts, configuring system services (including Firefox), configuring a daemon to watch for URL changes, and setting up a autostart program that starts Firefox in kiosk mode.

## **System Configuration**

**Disable Swap**

Edit `/etc/sysctl.conf`and append `vm.swappiness=0`

**Configure WiFi**

Online:

	sudo nmcli device wifi connect 'St. Francis Yacht Club' password <password>

Offline:

	sudo nmcli connection add type wifi wifi.ssid 'St. Francis Yacht Club' wifi-sec.key-mgmt wpa-psk wifi-sec.psk <password>

**Disable avahi**

`avahi` is a discovery service that's not needed on the kiosk systems and has a bug that fills the system log files in some IPv6 environments.

      sudo systemctl stop avahi-daemon
      sudo systemctl disable avahi-daemon

**Remove unused packages then update system**

	sudo apt-get remove --purge cups chromium cups-browsed cups-client cups-common cups-core-drivers cups-daemon cups-filters cups-filters-core-drivers cups-server-common cups-ipp-utils cups-pk-helper libcamera-ipa libcamera-tools libcamera0.3
	sudo apt-get update
	sudo apt-get install unclutter emacs
	sudo apt-get full-upgrade

In `raspi-config` under `Advanced Settings` switch to X. Optionally disable the splash screen.

**Get the kiosk scripts**
      mkdir ~/src; cd ~/src; git clone https://github.com/lanceberc/WebKiosks
      cd WebKiosks
      mkdir ~/bin
      cp -p kiosk/* ~/bin

**Configure Firefox**

Fireup Firefox and disable the sidebar and reloading windows upon reboot. Disable hardware acceleration on Raspberry Pi 4 until video acceleration is fixed.

*To do:* Figure out how to do this off-line with Firefox profiles.

## **Configure autostart and the URL checking service**

**Configure Kiosk**


Autostart notes from the [Raspberry Pi forums](https://forums.raspberrypi.com/viewtopic.php?t=294014)

	mkdir -p ~/config/autostart
	
Put this in `~/.config/autostart/kiosk.desktop`

	[Desktop Entry]
	Name=Kiosk
	Exec=/home/stfyc/bin/kiosknanny
	Terminal=true

Then make it executable with `chmod +x ~/.config/autostart/kiosk.desktop`

**Customize the kiosk instance**

Edit ~/bin/{kiosk-config.url, kiosk.role}
**Configure the kioskcheck service**

	sudo bash
	(cd /etc/systemd/system ; ln -s /home/stfyc/bin/kioskcheck.service .)
	systemctl enable kioskcheck.service
	systemctl start kioskcheck

**Restart firefox daily**

Using `crontab -e` add this to kill firefox at 3am

      0 3 * * * /usr/bin/killall firefox
      2 3 * * * /usr/bin/killall crashhelper
