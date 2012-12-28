#!/bin/bash

# Start network manager
nm-applet &

# Enable compositing
xcompmgr &

# Notifications tray
( sleep 5s && trayer --edge top --align right --transparent true --alpha 0 --tint 0x121212 --height 14 --widthtype request --margin 100 ) &

# Volume icon
volti &

# Mouse cursor
xsetroot -cursor_name left_ptr &

# Hide mouse when idle
unclutter -idle 5 &

# Screensaver
xscreensaver -no-splash &

# Notification daemon for notify-send
/usr/lib/notification-daemon/notification-daemon &

# Set wallpaper
feh --bg-scale images/wallpapers/anna_fisher_1920x1800.jpg &

terminator &

~/programs/firefox/firefox &

gvim &

pidgin &

vlc &

( sleep 15 && mediatomb ) &
