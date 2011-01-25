-- Imports.
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
    , [className =? "Firefox"   --> doF (W.shift "2:web")]
    , [className =? "Minefield" --> doF (W.shift "2:web")]
    , [className =? "Iceweasel" --> doF (W.shift "2:web")]
    , [className =? "Gvim"      --> doF (W.shift "3:edit")]
    , [className =? "Vlc"       --> doF (W.shift "4:media")]
    ]
    where
    myFloats      = ["Gimp", "gimp"]
    myOtherFloats = ["Downloads", "Firefox Preferences", "Save As..."]
    myIgnores     = []

-- The main function.
--main = do
--	spawn "sh ~/.xmonad/autostart.sh"
--	xmonad =<< statusBar myBar myPP toggleStrutsKey myConfig
main = do
	spawn "sh ~/.xmonad/autostart.sh"
	xmproc <- spawnPipe "xmobar ~/.xmobarrc"
	xmonad $ defaultConfig
		{ workspaces = ["1:cli","2:web","3:edit","4:media","5","6","7","8","9","0","-","="]
		, manageHook = myManageHook <+> manageHook defaultConfig -- uses default too
		, layoutHook = avoidStruts $ smartBorders $ layoutHook defaultConfig
		, logHook    = dynamicLogWithPP $ xmobarPP
			{ ppOutput = hPutStrLn xmproc
			, ppTitle  = xmobarColor "green" "" . shorten 50
			}
		, modMask    = mod4Mask
        } `additionalKeys`
		[ ((mod4Mask, xK_w),     spawn "~/apps/firefox/firefox")
		, ((mod4Mask, xK_g),     spawn "gimp")
		, ((mod4Mask, xK_m),     spawn "vlc")
		, ((mod4Mask, xK_t),     spawn "terminator")
		, ((0,        xK_Print), spawn "scrot")
		]

-- Command to launch the bar.
--myBar = "xmobar"

-- Custom PP, configure it as you like. It determines what's being written to the bar.
--myPP = xmobarPP { ppCurrent = xmobarColor "#429942" "" . wrap "<" ">" }

-- Keybinding to toggle the gap for the bar.
--toggleStrutsKey XConfig { XMonad.modMask = modMask } = (modMask, xK_b)

-- Main configuration, override the defaults to your liking.
--myConfig = defaultConfig { modMask = mod4Mask }
