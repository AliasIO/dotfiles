#!/bin/bash

# Start network manager
nm-applet &

# Disable beep
xset b off &

# Screensaver
xscreensaver -no-splash &

# Notification daemon for notify-send
/usr/lib/notification-daemon/notification-daemon &

# Set wallpaper
#xloadimage -onroot -center -border black ~/images/wallpapers/atom1600x900.png &

terminator &

~/apps/firefox/firefox &

#~/apps/bitcoin/bin/64/bitcoin &

gvim &

pidgin &

(sleep 1s && vlc) &
