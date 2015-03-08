#!/bin/bash

# Start network manager
nm-applet &

# Enable compositing
compton -C -o.25 -r10 -l-15 -t-15  --inactive-dim=.1 --no-fading-openclose &

# Notifications tray
trayer --edge bottom --align center --transparent true --alpha 0 --tint 0x121212 --height 16 --widthtype request --margin 95 --expand true &

# Volume icon
volti &
#pnmixer &

# Mouse cursor
xsetroot -cursor_name left_ptr &

# Hide mouse when idle
unclutter -idle 5 &

# Screensaver
xscreensaver -no-splash &

# Notification daemon for notify-send
/usr/lib/notification-daemon/notification-daemon &

# Set wallpaper
feh --bg-center ~/dotfiles/wallpapers/atom_1600x900_black.png &

terminator &

/home/elbert/apps/firefox/firefox &

/home/elbert/apps/thunderbird/thunderbird &

gvim &

vlc --extraintf http --http-port 9090 &

owncloud &

mediatomb &
