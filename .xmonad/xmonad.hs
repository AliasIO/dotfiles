-- Imports.
import XMonad
import XMonad.Hooks.DynamicLog
import qualified XMonad.StackSet as W -- to shift and float windows
 
-- The main function.
main = do
	spawn "sh ~/.xmonad/autostart.sh"
	xmonad =<< statusBar myBar myPP toggleStrutsKey myConfig

-- Command to launch the bar.
myBar = "xmobar"

-- Custom PP, configure it as you like. It determines what's being written to the bar.
myPP = xmobarPP { ppCurrent = xmobarColor "#429942" "" . wrap "<" ">" }

-- Keybinding to toggle the gap for the bar.
toggleStrutsKey XConfig {XMonad.modMask = modMask} = (modMask, xK_b)

-- Main configuration, override the defaults to your liking.
myConfig = defaultConfig { modMask = mod4Mask }

-- manageHook
manageHook' = composeAll . concat $
    [ [className =? c --> doFloat | c <- myFloats]
    , [title     =? t --> doFloat | t <- myOtherFloats]
    , [resource  =? r --> doFloat | r <- myIgnores]
    , [className =? "Firefox"          --> doF (W.shift "1")]
    , [className =? "Gvim"             --> doF (W.shift "3")]
    , [title     =? "VLC media player" --> doF (W.shift "2")]
    ]
    where
    myFloats      = ["Gimp", "gimp"]
    myOtherFloats = ["Downloads", "Firefox Preferences", "Save As..."]
    myIgnores     = []
