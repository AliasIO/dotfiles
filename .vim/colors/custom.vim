set background=dark

hi clear

if exists("syntax_on")
  syntax reset
endif

"set environment to 256 colours
set t_co=256

let colors_name = "custom"

if version >= 700
	hi cursorline   guifg=NONE    guibg=#0c0c0c gui=NONE      ctermfg=NONE ctermbg=NONE cterm=NONE
	hi cursorcolumn guifg=NONE    guibg=#0c0c0c gui=NONE      ctermfg=NONE ctermbg=NONE cterm=NONE
	hi matchparen   guifg=#ec7603 guibg=NONE    gui=bold      ctermfg=3    ctermbg=NONE cterm=NONE
endif

"background and menu colors
hi cursor           guifg=#000000 guibg=#ffffff gui=NONE      ctermfg=NONE ctermbg=NONE cterm=NONE
hi folded           guifg=#ffffff guibg=#222222 gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi incsearch        guifg=#000000 guibg=#ec7603 gui=NONE      ctermfg=0    ctermbg=3    cterm=NONE
hi linenr           guifg=#363330 guibg=#060300 gui=NONE      ctermfg=5    ctermbg=NONE cterm=NONE
hi nontext          guifg=#363330 guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi normal           guifg=#eeeeee guibg=#161310 gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi pmenu            guifg=#767370 guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi pmenusel         guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=2    ctermbg=NONE cterm=NONE
hi search           guifg=#000000 guibg=#ec7603 gui=NONE      ctermfg=0    ctermbg=3    cterm=NONE
hi specialkey       guifg=#363330 guibg=NONE    gui=NONE      ctermfg=0    ctermbg=NONE cterm=NONE
hi statusline       guifg=#767370 guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi statuslinenc     guifg=#333333 guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=italic
hi tabline          guifg=#767370 guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi tablinesel       guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=3    ctermbg=NONE cterm=NONE
hi tablinefill      guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi treeclosable     guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi treedir          guifg=#678cb1 guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi treedirslash     guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=8    ctermbg=NONE cterm=NONE
hi treefile         guifg=#93c762 guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi treehelp         guifg=#767370 guibg=NONE    gui=NONE      ctermfg=8    ctermbg=NONE cterm=NONE
hi treeopenable     guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi treepartfile     guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi treero           guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi treeup           guifg=#767370 guibg=NONE    gui=NONE      ctermfg=8    ctermbg=NONE cterm=NONE
hi title            guifg=#ffffff guibg=NONE    gui=bold      ctermfg=7    ctermbg=NONE cterm=bold
hi underlined       guifg=#ffffff guibg=NONE    gui=underline ctermfg=7    ctermbg=NONE cterm=underline
hi vertsplit        guifg=#333333 guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi visual           guifg=NONE    guibg=#22282a gui=NONE      ctermfg=0    ctermbg=5    cterm=NONE
hi visualnos        guifg=NONE    guibg=#22282a gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi warningmsg       guifg=#93c762 guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE
hi wildmenu         guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=7    ctermbg=NONE cterm=NONE

"syntax highlighting
hi comment          guifg=#767370 guibg=NONE    gui=NONE      ctermfg=7    cterm=NONE   cterm=NONE
hi constant         guifg=#a082bc guibg=NONE    gui=bold      ctermfg=5    cterm=bold   cterm=NONE
hi function         guifg=#5dc0d4 guibg=NONE    gui=NONE      ctermfg=6    cterm=NONE   cterm=NONE
hi identifier       guifg=#93c762 guibg=NONE    gui=NONE      ctermfg=2    cterm=NONE   cterm=NONE
hi keyword          guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=7    cterm=NONE   cterm=NONE
hi number           guifg=#f7ca1e guibg=NONE    gui=NONE      ctermfg=1    cterm=NONE   cterm=NONE
hi preproc          guifg=#a082bc guibg=NONE    gui=NONE      ctermfg=5    cterm=NONE   cterm=NONE
hi statement        guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=7    cterm=NONE   cterm=NONE
hi special          guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=7    cterm=NONE   cterm=NONE
hi string           guifg=#f68330 guibg=NONE    gui=NONE      ctermfg=3    cterm=NONE   cterm=NONE
hi tablinefill      guifg=#ffffff guibg=NONE    gui=NONE      ctermfg=7    cterm=NONE   cterm=NONE
hi type             guifg=#678cb1 guibg=NONE    gui=NONE      ctermfg=4    cterm=NONE   cterm=NONE
