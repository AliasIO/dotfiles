set background=dark

hi clear

if exists("syntax_on")
  syntax reset
endif

"set environment to 256 colours
set t_co=256

let colors_name = "custom"

if version >= 700
	hi cursorline     guifg=NONE    guibg=#060606 gui=NONE ctermfg=NONE ctermbg=16 cterm=NONE
	hi cursorcolumn   guifg=NONE    guibg=#060606 gui=NONE ctermfg=NONE ctermbg=16 cterm=NONE
	hi matchparen     guifg=#99ff00 guibg=NONE    gui=bold ctermfg=2    ctermbg=16 cterm=NONE
endif

"background and menu colors
hi cursor           guifg=#000000 guibg=#ffffff gui=NONE      ctermfg=NONE ctermbg=15   cterm=NONE
hi folded           guifg=#ffffff guibg=#111111 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi incsearch        guifg=#000000 guibg=#99ff00 gui=NONE      ctermfg=16   ctermbg=15   cterm=NONE
hi linenr           guifg=#333333 guibg=#000000 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi nontext          guifg=#222222 guibg=#000000 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi normal           guifg=#eeeeee guibg=#000000 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi pmenu            guifg=#ffffff guibg=#111111 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi pmenusel         guifg=#99ff00 guibg=#222222 gui=NONE      ctermfg=2    ctermbg=16   cterm=NONE
hi search           guifg=NONE    guibg=#111111 gui=NONE      ctermfg=NONE ctermbg=16   cterm=NONE
hi specialkey       guifg=#111111 guibg=#000000 gui=NONE      ctermfg=0    ctermbg=16   cterm=NONE
hi statusline       guifg=#ffffff guibg=#111111 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi statuslinenc     guifg=#ffffff guibg=#111111 gui=italic    ctermfg=15   ctermbg=16   cterm=italic
hi tabline          guifg=#eeeeee guibg=#111111 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi tablinesel       guifg=#99ff00 guibg=#222222 gui=NONE      ctermfg=2    ctermbg=16   cterm=NONE
hi tablinefill      guifg=#eeeeee guibg=#111111 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi treeclosable     guifg=#eeeeee guibg=#000000 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi treedir          guifg=#99ff00 guibg=#000000 gui=NONE      ctermfg=7    ctermbg=16   cterm=NONE
hi treedirslash     guifg=#777777 guibg=#000000 gui=NONE      ctermfg=8    ctermbg=16   cterm=NONE
hi treefile         guifg=#ffffff guibg=#000000 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi treehelp         guifg=#777777 guibg=#000000 gui=NONE      ctermfg=8    ctermbg=16   cterm=NONE
hi treeopenable     guifg=#eeeeee guibg=#000000 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi treepartfile     guifg=#eeeeee guibg=#000000 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi treero           guifg=#eeeeee guibg=#000000 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi treeup           guifg=#777777 guibg=#000000 gui=NONE      ctermfg=8    ctermbg=16   cterm=NONE
hi title            guifg=#ffffff guibg=NONE    gui=bold      ctermfg=15   ctermbg=NONE cterm=bold
hi underlined       guifg=#eeeeee guibg=#000000 gui=underline ctermfg=15   ctermbg=16   cterm=underline
hi vertsplit        guifg=#333333 guibg=#000000 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi visual           guifg=#ffffff guibg=#222222 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi visualnos        guifg=#ffffff guibg=#222222 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi warningmsg       guifg=#99ff00 guibg=#000000 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE
hi wildmenu         guifg=#99ff00 guibg=#222222 gui=NONE      ctermfg=15   ctermbg=16   cterm=NONE

"ctags
hi mytaglisttagname  guifg=#eeeeee guibg=#000000 gui=NONE ctermfg=NONE ctermbg=15 cterm=NONE
hi mytaglisttagscope guifg=#eeeeee guibg=#000000 gui=NONE ctermfg=NONE ctermbg=15 cterm=NONE
hi mytaglisttitle    guifg=#99ff00 guibg=#000000 gui=NONE ctermfg=NONE ctermbg=15 cterm=NONE
hi mytaglistcomment  guifg=#777777 guibg=#000000 gui=NONE ctermfg=NONE ctermbg=15 cterm=NONE
hi mytaglistfilename guifg=#ffffff guibg=#000000 gui=NONE ctermfg=NONE ctermbg=15 cterm=NONE

"syntax highlighting
hi comment       guifg=#ff9900 gui=italic ctermfg=8  cterm=NONE
hi constant      guifg=#e6db74 gui=bold   ctermfg=15 cterm=bold
hi function      guifg=#0099ff gui=NONE   ctermfg=7  cterm=NONE
hi identifier    guifg=#99ff00 gui=NONE   ctermfg=2  cterm=NONE
hi keyword       guifg=#ffffff gui=NONE   ctermfg=15 cterm=NONE
hi number        guifg=#ffffff gui=NONE   ctermfg=15 cterm=NONE
hi preproc       guifg=#FF0099 gui=NONE   ctermfg=8  cterm=NONE
hi statement     guifg=#999999 gui=NONE   ctermfg=15 cterm=NONE
hi special       guifg=#ffffff gui=NONE   ctermfg=15 cterm=NONE
hi string        guifg=#ffffff gui=NONE   ctermfg=15 cterm=NONE
hi tablinefill   guifg=#ffffff gui=NONE   ctermfg=15 cterm=NONE
hi type          guifg=#99ff00 gui=NONE   ctermfg=7  cterm=NONE
