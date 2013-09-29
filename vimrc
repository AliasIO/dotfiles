"set autochdir                          "Change working directory when opening file
set completeopt=menu                   "Autocomplete
set encoding=utf-8                     "Set encoding to UTF-8
set history=999                        "Keep a history of commands
set fileencodings=utf-8,latin2         "File encodings
set fileformats=unix,dos               "File formats
set foldmethod=marker                  "Specify folds with markers
set hidden                             "Remember undo after quitting
set nobackup                           "No backup files
set nocompatible                       "Use Vim improvements
set noerrorbells                       "Turn off beep on error
set nofoldenable                       "Disable folding
set noswapfile                         "Don't use swap files
set visualbell                         "Visual bell instead of beep on error
set mouse=a                            "Enable mouse in all modes
set nowrap                             "Do not wrap lines
set nowritebackup                      "No backup before overwriting files
set number                             "Show line numbers
set omnifunc=syntaxcomplete#Complete   "Enable autocomplete
set scrolloff=5                        "Vertical scroll offset
set showmatch                          "Show matching bracket
set sidescroll=1                       "Better horizontal scrolling
set sidescrolloff=5                    "Horizontal scroll offset
set t_vb=""                            "No terminal visual bell
set wildmenu                           "Show wild menu
set wildmode=full                      "Complete first match
set t_Co=256                           "Use 256 colours

execute pathogen#infect()

syntax on                              "Turn on syntax highlighting

"SEARCH OPTIONS
set ignorecase                         "Case insensitive search
set incsearch                          "Incremental search
set hlsearch                           "Highlight search
set smartcase                          "Case sensitive search if upper case chars are used

"Center page on the next/previous search
map N Nzz
map n nzz

"INDENTATION OPTIONS
set autoindent                         "Auto-indent new lines
set nocindent                          "Use smartindent instead
set noexpandtab                        "Use tabs, not spaces
set shiftwidth=2                       "Tab width for indentation
set smartindent                        "Smart indentation
set tabstop=2                          "Tab width

set nolist                             "List invisible characters
set listchars=tab:→\ ,eol:↵,trail:.

filetype indent on

"Prevent smartindent from removing leading whitespace before #
:inoremap # X#

set cinkeys    -=0#
set indentkeys -=0#

"AUTO COMMANDS

"Indent ruby code with two spaces
au Filetype ruby setlocal expandtab tabstop=2 shiftwidth=2

"Indent sass code with tabs
au Filetype sass setlocal noexpandtab tabstop=2 shiftwidth=2

"Disable auto-comment
au FileType * setlocal formatoptions-=c formatoptions-=r formatoptions-=o

"Load filetype specific plugins
filetype plugin on

"PHP OPTIONS
"let phpHtmlInStrings = 0
"let php_noShortTags  = 0

"CTAGS OPTIONS
set tags+=tags;$HOME

"Set the names of flags
let tlist_php_settings = 'php;c:class;f:function;d:constant'

"Close all folds except for current file
let Tlist_File_Fold_Auto_Close = 1

"Make tlist pane active when opened
let Tlist_GainFocus_On_ToggleOpen = 1

"Width of window
let Tlist_WinWidth = 40

"Close tlist when a selection is made
let Tlist_Close_On_Select = 1

"GUI OPTIONS
set laststatus=2                       "Show status line
set noruler                            "Don't show the cursor position
set showtabline=2                      "Always show the tabline
set statusline=%F%=%{SyntasticStatuslineFlag()}(%{strlen(&ft)?&ft:'?'},%{&fenc},%{&ff})%r
set tabline=%!MyTabLine()              "Custom tabline

function! MyTabLine()
	let s = ''

	for i in range(tabpagenr('$'))
		if i + 1 == tabpagenr()
			let s .= '%#TabLineSel#'
		else
			let s .= '%#TabLine#'
		endif

		" the label is made by MyTabLabel()
		let s .= ' %{MyTabLabel(' . ( i + 1 ) . ')} '
	endfor

	" after the last tab fill with TabLineFill and reset tab page nr
	let s .= '%#TabLineFill#%T'

	return s
endfunction

function! MyTabLabel(n)
	let label     = ''
	let bufnrlist = tabpagebuflist(a:n)

	"Tab number
	let label .= a:n . ': '

	"Buffer name
	let name = bufname(bufnrlist[tabpagewinnr(v:lnum) - 1])

	if name == ''
		if &buftype == 'quickfix'
			let name = '[Quickfix List]'
		else
			let name = '[No Name]'
		endif
	else
		"Show only the filename
		let name = fnamemodify(name,":t")
	endif

	let label .= name

	"Number of windows
	let wincount = tabpagewinnr(a:n, '$')

	if wincount > 1
		let label .= ' (' . wincount . ')'
	endif

	return label
endfunction

colorscheme alias                    "Use custom colour scheme

if has("gui_running")
	set guifont=DejaVu\ Sans\ Mono\ 10
	"set guifont=Terminus\ 10
	set guioptions=abirLb              "Cross-app paste, scrollbars, no toolbars
	set nocursorline                   "Don't highlight the current line
	set spell                          "Enable spell checking

	if has("autocmd")
		autocmd GUIEnter * set t_vb=     "No visual bell
	endif
else
	set nocursorline                   "Don't highlight the current line
	set nospell                        "Disable spell checking
endif

"MISC
if has("autocmd")
	"Restore cursor position when re-opening file
	autocmd BufReadPost * normal `"
	
	"TypeScript files
	autocmd BufRead,BufNewFile *.ts set filetype=typescript
	
	"Less files
	autocmd BufRead,BufNewFile *.less set filetype=css
	
	"Drupal file extensions
	autocmd BufRead,BufNewFile *.module,*.install set filetype=php

	"Remove trailing whitespace and DOS line endings on save
	autocmd BufWritePre *.php,*.rb,*.js,*.html,*.css :call StripTrailingWhitespace()

	"Apply .vimrc changes on save
	"autocmd BufWritePost .vimrc source $MYVIMRC

	"Custom mappings for plugins
	autocmd VimEnter * call Plugins()
endif

"Strip trailing whitespace without moving the cursor
function! StripTrailingWhitespace()
	let l = line(".")
	let c =  col(".")

	%s/\(\s\|\)\+$//e

	call cursor(l, c)
endfunction

"Tab to auto-complete only when on a word
function! InsertTabWrapper()
	let col = col('.') - 1

	if !col || getline('.')[col - 1] !~ '\k'
		return "\<tab>"
	else
		return "\<c-p>"
	endif
endfunction

"PLUGIN OPTIONS
function! Plugins()
	"NERDTree
	if exists(":NERDTree")
		let NERDTreeQuitOnOpen=1

		nnoremap <Leader>n :NERDTreeToggle<CR>
	endif

	"Tabular
	if exists(":Tabularize")
		nnoremap <Leader>t= :Tabularize /=>\?<CR>
		vnoremap <Leader>t= :Tabularize /=>\?<CR>
		nnoremap <Leader>t: :Tabularize /:\zs<CR>
		vnoremap <Leader>t: :Tabularize /:\zs<CR>
	endif

	"HexHighlight
	if exists("*HexHighlight")
		nnoremap <Leader>h :call HexHighlight()<CR>
	endif
endfunction

"Powerline
"set guifont=DejaVu\ Sans\ Mono\ for\ Powerline\ 10

"let Powerline_symbols = 'fancy'

"CUSTOM COMMANDS & MAPPINGS
"Avoid holding shift in normal mode
noremap ; :
noremap : ;

"Edit .vimrc
nnoremap <Leader>v :e ~/.vimrc<CR>

"Stop highlighting search words
nnoremap <Esc><Esc> :nohlsearch<CR>

"Toggle highlighting of special chars
nnoremap <Space> :set list!<CR>

"Delete all buffers
nnoremap <silent> <Leader>bd :1,999 bd<CR>

"Toggle statusline
nnoremap <silent> <Leader>s :exec &laststatus == 1 ? "set laststatus=2" : "set laststatus=1"<CR>

"Tab to autocomplete
"inoremap <tab> <c-r>=InsertTabWrapper()<cr>

"Generate tags list
nnoremap <Leader>cg :!/usr/bin/ctags -R .<CR>

"Jump to definition in new tab
nnoremap <CR>       :tab split<CR>:exec("tag ".expand("<cword>"))<CR>

"Jump to definition in new split
nnoremap <Leader>cs :vs       <CR>:exec("tag ".expand("<cword>"))<CR>

"Easier tab navigation
nnoremap <silent> <C-Tab>   :tabnext<CR>
nnoremap <silent> <C-S-Tab> :tabprevious<CR>
nnoremap <silent> <C-t>     :tabnew<CR>
nnoremap <silent> <C-w>     :tabclose<CR>

"Shift blocks visually
vnoremap < <gv
vnoremap > >gv

"Scroll page (faster) with ctrl+j/k, cursor at edge of screen
map <C-j> 3<C-e>L
map <C-k> 3<C-y>H

"Can't touch this
map <Up>        <nop>
map <Down>      <nop>
map <Left>      <nop>
map <Right>     <nop>
map <Del>       <nop>
map <Home>      <nop>
map <End>       <nop>
map <PageUp>    <nop>
map <PageDown>  <nop>

imap <Up>       <nop>
imap <Down>     <nop>
imap <Left>     <nop>
imap <Right>    <nop>
imap <Del>      <nop>
imap <Home>     <nop>
imap <End>      <nop>
imap <PageUp>   <nop>
imap <PageDown> <nop>
