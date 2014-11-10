-- Imports
import XMonad
-- Prompt
import XMonad.Prompt
import XMonad.Prompt.RunOrRaise (runOrRaisePrompt)
import XMonad.Prompt.AppendFile (appendFilePrompt)
-- Hooks
import XMonad.Operations
 
import System.IO
import System.Exit
 
import XMonad.Util.Run
 
import XMonad.Actions.CycleWS
 
import XMonad.Hooks.ManageDocks
import XMonad.Hooks.ManageHelpers
import XMonad.Hooks.SetWMName
import XMonad.Hooks.DynamicLog
import XMonad.Hooks.UrgencyHook
import XMonad.Hooks.FadeInactive
import XMonad.Hooks.EwmhDesktops
 
import XMonad.Layout.NoBorders (smartBorders, noBorders)
import XMonad.Layout.PerWorkspace (onWorkspace, onWorkspaces)
import XMonad.Layout.Reflect (reflectHoriz)
import XMonad.Layout.IM
import XMonad.Layout.Reflect
import XMonad.Layout.SimpleFloat
import XMonad.Layout.Spacing
import XMonad.Layout.ResizableTile
import XMonad.Layout.LayoutHints
import XMonad.Layout.LayoutModifier
import XMonad.Layout.Grid
 
import Data.Ratio ((%))
 
import qualified XMonad.StackSet as W -- To shift and float windows
import qualified Data.Map as M
 
-- Config
-- Define modMask
modMask'     :: KeyMask
modMask'     = mod4Mask
-- Define Terminal
myTerminal   = "terminator"
-- Define workspaces
myWorkspaces = ["1","2","3","4","5","6","7","8","9"]
-- Dzen/Conky
myXmonadBar  = "dzen2 -x '0' -y '0' -h '16' -w '960' -ta 'l' -fg '#FFF' -bg '#000' -fn " ++ xlfdFont
myStatusBar  = "conky -c /home/elbert/.xmonad/conky_dzen | dzen2 -x '960' -w '960' -h '16' -ta 'r' -bg '#000' -fg '#FFFFFF' -y '0' -fn " ++ xlfdFont
myBitmapsDir = "/home/elbert/.xmonad/dzen2"

-- Main
main = do
	spawn "sh ~/.xmonad/autostart.sh"
	dzenLeftBar <- spawnPipe myXmonadBar
	dzenRightBar <- spawnPipe myStatusBar
	xmonad $ withUrgencyHook NoUrgencyHook $ defaultConfig
		{ terminal            = myTerminal
		, workspaces          = myWorkspaces
		, keys                = keys'
		, modMask             = modMask'
		, layoutHook          = layoutHook'
		, manageHook          = manageHook'
		, logHook             = myLogHook dzenLeftBar >> fadeInactiveLogHook 1
		, normalBorderColor   = colorNormalBorder
		, focusedBorderColor  = colorFocusedBorder
		, borderWidth         = 0
		}

-- Hooks
-- ManageHook
manageHook' :: ManageHook
manageHook' = manageDocks <+> (composeAll . concat $
	[ [resource  =? r --> doIgnore       | r <- myIgnores]
	, [resource  =? r --> doFloat        | r <- myFloats]
	, [className =? c --> doShift  "1"   | c <- myTerminal]
	, [className =? c --> doShift  "2"   | c <- myWeb]
	, [className =? c --> doShift  "3"   | c <- myDev]
	, [className =? c --> doShift	 "4"   | c <- myChat]
	, [className =? c --> doShift	 "5"   | c <- myEmail]
	, [className =? c --> doShift  "6"   | c <- myGraphics]
	, [className =? c --> doShift  "8"   | c <- myVM]
	, [className =? c --> doF W.swapDown | c <- mySwapDowns]
	, [className =? c --> doCenterFloat  | c <- myCenterFloats]
	, [isDialog       --> doCenterFloat]
	, [isFullscreen   --> myDoFullFloat]
	]) 
	where
		role       = stringProperty "WM_WINDOW_ROLE"
		name       = stringProperty "WM_NAME"

		-- classnames
		myTerminal     = ["terminator"]
		myWeb          = ["Firefox","Aurora"]
		myDev          = ["Gvim"]
		myChat         = ["Pidgin","Skype","Vlc"]
		myEmail        = ["Thunderbird"]
		myGraphics     = ["Gimp"]
		myVM           = ["VirtualBox"]
		mySwapDowns    = ["Thunar","Pcmanfm"]
		myCenterFloats = []
		myFloats       = []
		-- resources   
		myIgnores      = ["notify-osd","trayer"]

-- A trick for fullscreen but stil allow focusing of other WSs
myDoFullFloat :: ManageHook
myDoFullFloat = doF W.focusDown <+> doFullFloat

layoutHook' = avoidStruts $ smartBorders $ 
              onWorkspaces ["3"] devLayout $
              onWorkspaces ["4"] imLayout $
              onWorkspaces ["6"] devLayout $
              myLayout
 
-- Bar
myLogHook :: Handle -> X ()
myLogHook h = dynamicLogWithPP $ defaultPP
	{ ppCurrent         = dzenColor "#FFF" "" . wrap "[" "]"
	, ppHidden          = dzenColor "#888" ""
	, ppHiddenNoWindows = dzenColor "#666" ""
	, ppOutput          = hPutStrLn h
	, ppTitle           = dzenColor "#FFF" "" . shorten 500 . dzenEscape
	, ppUrgent          = dzenColor "#CF0" "" . wrap ">>>" "<<<"
	, ppVisible         = dzenColor "#666" ""
	, ppWsSep           = " "
	, ppSep             = " "
	, ppLayout          = dzenColor "#FD0" "" .
		(\x -> case x of
			"Grid"             -> "^i(" ++ myBitmapsDir ++ "/grid.xbm)"
			"ReflectX IM Grid" -> "^i(" ++ myBitmapsDir ++ "/imgrid.xbm)"
			"Mirror Tall"      -> "^i(" ++ myBitmapsDir ++ "/mtall.xbm)"
			"Full"             -> "^i(" ++ myBitmapsDir ++ "/full.xbm)"
			"Simple Float"     -> "~"
			_                  -> x
		)
	}
 
-- Layout
myLayout = Grid ||| Full
 
devLayout = mySplit ||| Full
  where
		mySplit = Mirror $ Tall nmaster delta ratio
			where
				nmaster = 1      -- The default number of windows in the master pane
				delta   = 3/100  -- Percent of screen to increment by when resizing panes
				ratio   = 70/100 -- Default proportion of screen occupied by master pane
 
imLayout = reflectHoriz $ withIM (1%6) (And (ClassName "Pidgin") (Role "buddy_list")) Grid ||| Grid

-- Theme
colorNormalBorder  = "#333"
colorFocusedBorder = "#FFF"
 
barFont  = "terminus"
barXFont = "terminus:size=8"
xftFont  = "xft:Terminus:size=8:antialias=true"
xlfdFont = "-*-terminus-*-r-normal-*-*-120-*-*-*-*-*-*"
 
-- Run or Raise Menu
mXPConfig :: XPConfig
mXPConfig =
	defaultXPConfig 
		{ font              = xftFont
		, bgColor           = "#000"
		, fgColor           = "#DF0"
		, bgHLight          = "#DF0"
		, fgHLight          = "#000"
		, promptBorderWidth = 0
		, height            = 20
		, historyFilter     = deleteConsecutive
		}
 
-- Key mapping
keys' conf@(XConfig {XMonad.modMask = modMask}) = M.fromList $
	[ ((modMask,                 xK_F2     ), runOrRaisePrompt mXPConfig)
	, ((0,                       xK_F1     ), spawn $ XMonad.terminal conf)
	, ((modMask .|. shiftMask,   xK_c      ), kill)
	, ((modMask .|. shiftMask,   xK_l      ), spawn "slock")
	-- Programs
	, ((0,                       xK_Print  ), spawn "scrot -e 'mv $f ~/screenshots/'")
	, ((modMask,                 xK_w      ), spawn "iceweasel")
	, ((modMask,                 xK_e      ), spawn "gvim")
	, ((modMask,                 xK_f      ), spawn "thunar")
	, ((modMask,                 xK_g      ), spawn "gimp")
	, ((modMask,                 xK_m      ), spawn "vlc --extraintf http --http-host localhost:9090")
	, ((modMask,                 xK_f      ), spawn "thunar")
	-- Media Keys
	, ((mod4Mask,                xK_s      ), spawn "amixer -q sset Master toggle")
	, ((mod4Mask,                xK_F11    ), spawn "amixer -q sset Master 3%-")
	, ((mod4Mask,                xK_F12    ), spawn "amixer -q sset Master 3%+")
	, ((0,                       xK_Pause  ), spawn "curl -s http://127.0.0.1:9090/requests/status.xml?command=pl_pause")
	, ((mod4Mask,                xK_n      ), spawn "curl -s http://127.0.0.1:9090/requests/status.xml?command=pl_next")
	, ((mod4Mask,                xK_p      ), spawn "curl -s http://127.0.0.1:9090/requests/status.xml?command=pl_previous")
	, ((0,                       0x1008ff12), spawn "amixer -q sset Master toggle") -- XF86AudioMute
	, ((0,                       0x1008ff11), spawn "amixer -q sset Master 3%-")    -- XF86AudioLowerVolume
	, ((0,                       0x1008ff13), spawn "amixer -q sset Master 3%+")    -- XF86AudioRaiseVolume
	, ((0,                       0x1008ff14), spawn "curl -s http://127.0.0.1:9090/requests/status.xml?command=pl_pause")
	, ((0,                       0x1008ff17), spawn "curl -s http://127.0.0.1:9090/requests/status.xml?command=pl_next")
	, ((0,                       0x1008ff16), spawn "curl -s http://127.0.0.1:9090/requests/status.xml?command=pl_previous")

	-- layouts
	, ((modMask,                 xK_space  ), sendMessage NextLayout)
	, ((modMask .|. shiftMask,   xK_space  ), setLayout $ XMonad.layoutHook conf)   -- reset layout on current desktop to default
	, ((modMask,                 xK_b      ), sendMessage ToggleStruts)
	, ((modMask,                 xK_r      ), refresh)
	, ((modMask,                 xK_Tab    ), windows W.focusDown)                  -- move focus to next window
	, ((modMask,                 xK_j      ), windows W.focusDown)
	, ((modMask,                 xK_k      ), windows W.focusUp  )
	, ((modMask .|. shiftMask,   xK_j      ), windows W.swapDown)                   -- swap the focused window with the next window
	, ((modMask .|. shiftMask,   xK_k      ), windows W.swapUp)                     -- swap the focused window with the previous window
	, ((modMask,                 xK_Return ), windows W.swapMaster)
	, ((modMask,                 xK_t      ), withFocused $ windows . W.sink)       -- Push window back into tiling
	, ((modMask,                 xK_h      ), sendMessage Shrink)                   -- %! Shrink a master area
	, ((modMask,                 xK_l      ), sendMessage Expand)                   -- %! Expand a master area
	, ((modMask,                 xK_comma  ), sendMessage (IncMasterN 1))
	, ((modMask,                 xK_period ), sendMessage (IncMasterN (-1)))

	-- workspaces
	, ((modMask .|. controlMask, xK_Right  ), nextWS)
	, ((modMask .|. shiftMask,   xK_Right  ), shiftToNext)
	, ((modMask .|. controlMask, xK_Left   ), prevWS)
	, ((modMask .|. shiftMask,   xK_Left   ), shiftToPrev)

	-- quit, or restart
	, ((modMask .|. shiftMask,   xK_q      ), io (exitWith ExitSuccess))
	, ((modMask,                 xK_q      ), spawn "killall conky dzen2 && /home/my_user/.cabal/bin/xmonad --recompile && /home/my_user/.cabal/bin/xmonad --restart")
	]
	++
	-- mod-[1..9] %! Switch to workspace N
	-- mod-shift-[1..9] %! Move client to workspace N
	[((m .|. modMask, k), windows $ f i)
		| (i, k) <- zip (XMonad.workspaces conf) [xK_1 .. xK_9]
		, (f, m) <- [(W.greedyView, 0), (W.shift, shiftMask)]]
	++

	--
	-- mod-{w,e,r}, Switch to physical/Xinerama screens 1, 2, or 3
	-- mod-shift-{w,e,r}, Move client to screen 1, 2, or 3
	--
	[((m .|. modMask, key), screenWorkspace sc >>= flip whenJust (windows . f))
		| (key, sc) <- zip [xK_w, xK_e, xK_r] [0..]
		, (f, m) <- [(W.view, 0), (W.shift, shiftMask)]]
