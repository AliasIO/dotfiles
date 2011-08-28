-- Imports
import Data.Ratio
import XMonad
import XMonad.Hooks.DynamicLog
import XMonad.Hooks.ManageDocks
import XMonad.Hooks.UrgencyHook
import XMonad.Util.EZConfig(additionalKeys)
import XMonad.Util.Run(spawnPipe)
import XMonad.Layout.Accordion
import XMonad.Layout.NoBorders
import XMonad.Layout.Spiral
import System.IO
import qualified XMonad.StackSet as W -- to shift and float windows

-- The main function
main = do
	spawn "sh ~/.xmonad/autostart.sh"
	xmproc <- spawnPipe "xmobar ~/.xmobarrc"
	xmonad $ withUrgencyHook NoUrgencyHook $ defaultConfig
		{ workspaces = myWorkspaces
		, manageHook = myManageHook <+> manageHook defaultConfig -- uses default too
		, layoutHook = avoidStruts $ smartBorders $ myLayouthook
		, logHook    = dynamicLogWithPP $ xmobarPP
			{ ppCurrent         = xmobarColor "#F09" "" . wrap "[" "]"
			, ppHidden          = xmobarColor "#FFF" ""
			, ppHiddenNoWindows = xmobarColor "#444" ""
			, ppLayout          = xmobarColor "#FFF" ""
			, ppOutput          = hPutStrLn xmproc
			, ppSep             = " | "
			, ppTitle           = xmobarColor "#9F0" "" . shorten 40
			, ppUrgent          = xmobarColor "#F90" "" . wrap "*" "*"
			, ppVisible         = xmobarColor "#FFF" ""
			, ppWsSep           = " "
			}
		, modMask            = mod4Mask
		, normalBorderColor  = "#444"
		, focusedBorderColor = "#FFF"
        } `additionalKeys` myKeys

myLayouthook = spiral (1 % 1) ||| Full ||| mySplit

mySplit = Mirror $ Tall nmaster delta ratio
    where
        nmaster = 1      -- The default number of windows in the master pane
        delta   = 3/100  -- Percent of screen to increment by when resizing panes
        ratio   = 70/100 -- Default proportion of screen occupied by master pane

myWorkspaces = ["1:CLI","2:WEB","3:CODE","4:MEDIA","5:FTP","6:DESIGN","7","8","9","0:BITCOIN"]

-- Organize windows
myManageHook :: ManageHook

myManageHook = composeAll . concat $
    [ [className =? c --> doFloat | c <- myFloats]
    , [title     =? t --> doFloat | t <- myOtherFloats]
    , [resource  =? r --> doFloat | r <- myIgnores]
    , [className =? "Firefox"              --> doF (W.shift "2:WEB")]
    , [className =? "Minefield"            --> doF (W.shift "2:WEB")]
    , [className =? "Iceweasel"            --> doF (W.shift "2:WEB")]
    , [className =? "Gvim"                 --> doF (W.shift "3:CODE")]
    , [className =? "Vlc"                  --> doF (W.shift "4:MEDIA")]
    , [title     =? "Alsa Mixer"           --> doF (W.shift "4:MEDIA")]
    , [title     =? "VLC"                  --> doF (W.shift "4:MEDIA")]
    , [title     =? "music - File Manager" --> doF (W.shift "4:MEDIA")]
    , [className =? "Gimp"                 --> doF (W.shift "6:DESIGN")]
    , [className =? "Bitcoin"              --> doF (W.shift "0:BITCOIN")]
    ]
    where
    myFloats      = ["Gimp", "gimp"]
    myOtherFloats = ["Downloads", "Firefox Preferences", "Save As..."]
    myIgnores     = []

-- Key bindings
myKeys =
	[ ((mod4Mask, xK_w),       spawn "~/apps/firefox/firefox")
	, ((mod4Mask, xK_e),       spawn "gvim")
	, ((mod4Mask, xK_f),       spawn "thunar")
	, ((mod4Mask, xK_g),       spawn "gimp")
	, ((mod4Mask, xK_m),       spawn "vlc")
	, ((0,        xK_F1),      spawn "terminator")
	, ((0,        xK_Print),   spawn "scrot")
	, ((mod4Mask, xK_F11),     spawn "amixer --quiet set Master 3-")
	, ((mod4Mask, xK_F12),     spawn "amixer --quiet set Master 3+")
	, ((mod4Mask, xK_s),       spawn "amixer --quiet set Master toggle")
	, ((0,        0x1008ff11), spawn "amixer --quiet set Master 3-")
	, ((0,        0x1008ff13), spawn "amixer --quiet set Master 3+")
	, ((0,        0x1008ff12), spawn "amixer --quiet set Master toggle")
	, ((mod4Mask, xK_b),       sendMessage ToggleStruts)
	, ((mod4Mask, xK_F),       spawn "kill `ps ax | grep firefox/plugin-container | grep -v grep | awk '{print $1}'`"
	]
    ++
    [ ((m .|. mod4Mask, k), windows $ f i) | (i, k) <- zip myWorkspaces numPadKeys
    , (f, m)                                        <- [(W.greedyView, 0), (W.shift, shiftMask)]
    ]

-- Non-numeric num pad keys, sorted by number
numPadKeys = [ xK_KP_End,  xK_KP_Down,  xK_KP_Page_Down -- 1, 2, 3
             , xK_KP_Left, xK_KP_Begin, xK_KP_Right     -- 4, 5, 6
             , xK_KP_Home, xK_KP_Up,    xK_KP_Page_Up   -- 7, 8, 9
             , xK_KP_Insert                             -- 0 
			 ]
