#!/bin/bash

# Start network manager
nm-applet &

# Enable compositing
xcompmgr &

# Notifications tray
( sleep 5s && trayer --edge top --align right --transparent true --alpha 0 --tint 0x121212 --height 14 --widthtype request --margin 120 ) &

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
#feh --bg-scale images/wallpapers/anna_fisher_1920x1800.jpg &
feh --bg-max ~/dotfiles/wallpapers/earth.jpg &

terminator &

~/apps/firefox/firefox &

~/apps/thunderbird/thunderbird &

gvim &

pidgin &

vlc &

# VPN
( sleep 5s && gksu "openvpn --config /home/elbert/apps/hidemyass/TCP/USA.Washington.Seattle_LOC1S10.TCP.ovpn --auth-user-pass /home/elbert/bin/vpnauth --route 106.187.102.84 255.255.255.255 net_gateway" ) &
