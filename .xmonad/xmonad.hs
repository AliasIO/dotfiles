-- Imports
import XMonad
import XMonad.Hooks.DynamicLog
import XMonad.Hooks.ManageDocks
import XMonad.Util.EZConfig(additionalKeys)
import XMonad.Util.Run(spawnPipe)
import XMonad.Layout.NoBorders
import System.IO
import qualified XMonad.StackSet as W -- to shift and float windows
 
-- manageHook
myManageHook :: ManageHook

myManageHook = composeAll . concat $
    [ [className =? c --> doFloat | c <- myFloats]
    , [title     =? t --> doFloat | t <- myOtherFloats]
    , [resource  =? r --> doFloat | r <- myIgnores]
    , [className =? "Firefox"      --> doF (W.shift "2-WEB")]
    , [className =? "Minefield"    --> doF (W.shift "2-WEB")]
    , [className =? "Iceweasel"    --> doF (W.shift "2-WEB")]
    , [className =? "Gvim"         --> doF (W.shift "3-EDIT")]
    , [className =? "Vlc"          --> doF (W.shift "4-MEDIA")]
    , [title     =? "Alsa Mixer"   --> doF (W.shift "4-MEDIA")]
    , [className =? "Transmission" --> doF (W.shift "6-PIRATE")]
    , [className =? "Nicotine"     --> doF (W.shift "6-PIRATE")]
    ]
    where
    myFloats      = ["Gimp", "gimp"]
    myOtherFloats = ["Downloads", "Firefox Preferences", "Save As..."]
    myIgnores     = []

-- The main function.
main = do
	spawn "sh ~/.xmonad/autostart.sh"
	xmproc <- spawnPipe "xmobar ~/.xmobarrc"
	xmonad $ defaultConfig
		{ workspaces = ["1-CLI","2-WEB","3-EDIT","4-MEDIA","5","6-PIRATE","7","8","9","0","-","="]
		, manageHook = myManageHook <+> manageHook defaultConfig -- uses default too
		, layoutHook = avoidStruts $ smartBorders $ layoutHook defaultConfig
		, logHook    = dynamicLogWithPP $ xmobarPP
			{ ppOutput  = hPutStrLn xmproc
			, ppCurrent = xmobarColor "#F09" "" . wrap "[" "]"
			, ppSep     = " - "
			, ppTitle   = xmobarColor "#9F0" "" . shorten 50
			}
		, modMask    = mod4Mask
        } `additionalKeys`
		[ ((mod4Mask, xK_w),     spawn "~/apps/firefox/firefox")
		, ((mod4Mask, xK_g),     spawn "gimp")
		, ((mod4Mask, xK_m),     spawn "vlc")
		, ((mod4Mask, xK_t),     spawn "terminator")
		, ((0,        xK_Print), spawn "scrot")
		, ((0,        xK_F11),   spawn "amixer --quiet set Master 3-")
		, ((0,        xK_F12),   spawn "amixer --quiet set Master 3+")
		, ((mod4Mask, xK_s),     spawn "amixer --quiet set Master toggle")
		]
