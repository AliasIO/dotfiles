## Start session manager
lxsession &

## Enable power management
xfce4-power-manager &

## Start Thunar Daemon
thunar --daemon &

## Set desktop wallpaper
nitrogen --restore &

## Launch panel
tint2 &

## Enable Eyecandy - off by default, uncomment one of the commands below.
## Note: cairo-compmgr prefers a sleep delay, else it tends to produce
## odd shadows/quirks around tint2 & Conky.
#(sleep 10s && cb-compmgr --cairo-compmgr) &
#cb-compmgr --xcompmgr & 

## Launch network manager applet
nm-applet &

## Detect and configure touchpad. See 'man synclient' for more info.
if egrep -iq 'touchpad' /proc/bus/input/devices; then
    synclient VertEdgeScroll=1 &
    synclient TapButton1=1 &
fi

## Start xscreensaver
xscreensaver -no-splash &

## Start Conky after a slight delay
conky -q &

## Start volumeicon after a slight delay
(sleep 3s && volumeicon) &

## Nautilus gconf settings, minimises the impact of running Nautilus under
## a pure Openbox session. Safe to delete if you are never going to use Nautilus,
## or, uncomment if you plan on installing and using Nautilus.
#gconftool-2 -s -t bool /apps/nautilus/preferences/show_desktop false &
#gconftool-2 -s -t bool /desktop/gnome/background/draw_background false &
#gconftool-2 -s -t bool /apps/nautilus/preferences/show_advanced_permissions true &

## The following command will set-up a keyboard map selection tool when
## running in a live session.
cb-setxkbmap-live &

## Transmission BitTorrent client
transmission -m &

## VNC server
/usr/lib/vino/vino-server &

## Editor
gvim &

## File manager
thunar &

## Browser
(sleep 5s && /home/elbertf/apps/firefox/firefox) &

## Enable passwordless login
(sleep 10s && ssh-add) &

# Autostart the Dropbox deamon
(sleep 60s && ~/.dropbox-dist/dropboxd) &

## cb-fortune - have Statler say a little adage
(sleep 120s && cb-fortune) &

# Android Notifier
/usr/share/android-notifier-desktop/run.sh &
