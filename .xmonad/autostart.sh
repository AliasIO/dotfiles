#!/bin/bash

# Start network manager
nm-applet &

# Set wallpaper
xloadimage -onroot -center -border black ~/images/wallpapers/spaceinvaders.gif &

# Enable passwordless SSH authentication
ssh-agent &

terminator -e htop -T "HTOP" &

(sleep 1s && terminator) &

~/apps/firefox/firefox &

gvim &

transmission &

nicotine &

terminator -e alsamixer -T "Alsa Mixer" &

(sleep 1s && vlc) &

## cb-fortune - have Statler say a little adage
#(sleep 120s && cb-fortune) &
