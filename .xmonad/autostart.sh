#!/bin/bash

# Start network manager
nm-applet &

# Set wallpaper
xloadimage -onroot -center -border black ~/images/wallpapers/spaceinvaders.gif &

# Enable passwordless SSH authentication
ssh-agent &

terminator &

# Start Firefox
~/apps/firefox/firefox &

# Start Gvim 
gvim &

vlc &

## cb-fortune - have Statler say a little adage
(sleep 120s && cb-fortune) &
