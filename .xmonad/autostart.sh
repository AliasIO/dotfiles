#!/bin/bash

# Start network manager
nm-applet &

# Screensaver
xscreensaver -no-splash &

# Set wallpaper
xloadimage -onroot -center -border black ~/images/wallpapers/skysurvey.org.jpg &

# Enable passwordless SSH authentication
ssh-agent &

#terminator -e htop -T "HTOP" &

terminator -e "vlc -I ncurses ~/music/*.pls" -T "VLC" &

#xchat &

terminator &

~/apps/firefox/firefox &

~/apps/bitcoin/bin/64/bitcoin &

gvim &

#thunar ~/music &

#terminator -e alsamixer -T "Alsa Mixer" &

#(sleep 1s && vlc) &

## VNC server
#(sleep 30s && /usr/lib/vino/vino-server) &

# Dropbox deamon
(sleep 60s && ~/.dropbox-dist/dropboxd) &

## cb-fortune - have Statler say a little adage
#(sleep 120s && cb-fortune) &
