-- Imports.
import XMonad
import XMonad.Hooks.DynamicLog
 
-- The main function.
main = do
	spawn "sh /home/elbertf/bin/autostart.sh"
	xmonad =<< statusBar myBar myPP toggleStrutsKey myConfig

-- Command to launch the bar.
myBar = "xmobar"

-- Custom PP, configure it as you like. It determines what's being written to the bar.
myPP = xmobarPP { ppCurrent = xmobarColor "#429942" "" . wrap "<" ">" }

-- Keybinding to toggle the gap for the bar.
toggleStrutsKey XConfig {XMonad.modMask = modMask} = (modMask, xK_b)

-- Main configuration, override the defaults to your liking.
myConfig = defaultConfig { modMask = mod4Mask }
