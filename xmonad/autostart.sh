#!/bin/bash

# GNOME PolicyKit and Keyring
eval $(gnome-keyring-daemon -s --components=pkcs11,secrets,ssh,gpg) &

# Start network manager
nm-applet &

# Notifications tray
(sleep 5s && trayer --edge top --align right --transparent true --tint 0x333333 --height 15 --widthtype request --margin 100 ) &

(sleep 5s && volumeicon ) &

# Disable beep
xset b off &

# Screensaver
xscreensaver -no-splash &

# Notification daemon for notify-send
/usr/lib/notification-daemon/notification-daemon &

# Set wallpaper
#xloadimage -onroot -center -border black ~/images/wallpapers/lines2.png &

terminator &

~/apps/firefox/firefox &

#~/apps/bitcoin/bin/64/bitcoin &

gvim &

pidgin &

(sleep 1s && vlc) &
