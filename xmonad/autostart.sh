#!/bin/bash

# Start network manager
nm-applet &

# Enable compositing
xcompmgr &

# Notifications tray
( sleep 5s && trayer --edge top --align right --transparent true --alpha 0 --tint 0x000000 --height 15 --widthtype request --margin 100 ) &

( sleep 5s && volumeicon > /dev/null 2>&1 ) &

# Mouse cursor
xsetroot -cursor_name left_ptr &

# Hide mouse when idle
unclutter -idle 5 &

# Screensaver
xscreensaver -no-splash &

# Notification daemon for notify-send
/usr/lib/notification-daemon/notification-daemon &

# Set wallpaper
feh --bg-scale images/wallpapers/anna_fisher_mirror.jpg &

terminator &

~/programs/firefox/firefox &

gvim &

pidgin &

vlc &
