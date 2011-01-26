set autochdir                          "Change working directory when opening file
set completeopt=longest,menu           "Pick longest item first on autocomplete
set encoding=utf-8                     "Set encoding to UTF-8
set history=999                        "Keep a history of commands
set fileencodings=utf-8,latin2         "File encodings
set fileformats=unix,dos               "File formats
set foldmethod=marker                  "Specify folds with markers
set hidden                             "Remember undo after quitting
set nobackup                           "No backup files
set nocompatible                       "Use Vim improvements
set noerrorbells                       "Turn off beep on error
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

syntax on                              "Turn on syntax highlighting

"{{{ SEARCH OPTIONS
set ignorecase                         "Case insensitive search
set incsearch                          "Incremental search
set hlsearch                           "Highlight search
set smartcase                          "Case sensitive search if upper case chars are used

"Center page on the next/previous search
map N Nzz
map n nzz
"}}}

"{{{ INDENTATION OPTIONS
set autoindent                         "Auto-indent new lines
set nocindent                          "Use smartindent instead
set noexpandtab                        "Use tabs, not spaces
set shiftwidth=4                       "Tab width for indentation
set smartindent                        "Smart indentation
set tabstop=4                          "Tab width

filetype indent off

"Prevent smartindent from removing leading whitespace before #
:inoremap # X#

set cinkeys    -=0#
set indentkeys -=0#

if has("autocmd")
	"Indent ruby code with two spaces
	autocmd Filetype ruby setlocal tabstop=2 shiftwidth=2

	"Disable auto-comment
	autocmd FileType * setlocal formatoptions-=orc
endif
"}}}

"{{{ PHP OPTIONS
let php_sql_query    = 0
let phpHtmlInStrings = 1
let php_noShortTags  = 1

"Load filetype specific plugins
filetype plugin on
"}}}

"{{{ CSS OPTIONS
if has("autocmd")
	"Automatically fix some CSS formatting issues
	autocmd BufWritePre *.css silent call FormatCSS()

	function! FormatCSS()
		normal mz

		"Hex color codes to uppercase
		:%s/\(.\+:.*\)\(#[0-9a-f]\{3,6\}\)/\1\U\2/e

		"Text before colon to lowercase
		:%s/\([^:]\+\)\(:.\+;\)/\L\1\E\2/e

		"Add a space after colons
		:%s/:\([^ ][^;]\+;\)/: \1/e

		normal `z
	endfunction
endif
"}}}

"{{{ GUI OPTIONS
set laststatus=1                       "Hide the status unless window is split
set noruler                            "Don't show the cursor position
set showtabline=2                      "Always show the tabline
set statusline=%t%=(%{strlen(&ft)?&ft:'?'},%{&fenc},%{&ff})%r
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
		let s .= ' %{MyTabLabel(' . (i + 1) . ')} '
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

colorscheme custom_mono                "Use custom color scheme

if has("gui_running")
	"set lines=45 columns=180           "Set window size
	set guifont=DejaVu\ Sans\ Mono\ 9
	set guioptions=abirLb              "Cross-app paste, scrollbars, no toolbars
	set nocursorline                   "Don't highlight the current line
	set spell                          "Enable spell checking

	if has("autocmd")
		autocmd GUIEnter * set t_vb=   "No visual bell
	endif
else
	set nocursorline                   "Don't highlight the current line
	set nospell                        "Disable spell checking
endif
"}}}

"{{{ MISC
if has("autocmd")
	"Restore cursor position when re-opening file
	autocmd BufReadPost * normal `"
	
	"Drupal file extensions
	autocmd BufRead,BufNewFile *.module,*.install set filetype=php

	"Remove trailing whitespace on save
	autocmd BufWritePre *.php,*.js,*.html,*.css :%s/\s\+$//e
	
	"Apply .vimrc changes on save
	autocmd BufWritePost .vimrc source $MYVIMRC
endif
"}}}

"{{{ NERDTREE OPTIONS
let NERDTreeQuitOnOpen=1

map <F4> ;NERDTreeToggle<CR>
"}}}

"{{{ CUSTOM COMMANDS & MAPPINGS
"Avoid holding shift in normal mode
noremap ; :
noremap : ;

"Edit .vimrc
map <Leader>v ;e ~/.vimrc<CR>

"Delete all buffers
map <silent> <Leader>bd ;1,999 bd<CR>

"Easier tab navigation
nnoremap <silent> <C-Right> :tabnext<CR>
nnoremap <silent> <C-Left>  :tabprevious<CR>
nnoremap <silent> <C-t>     :tabnew<CR>

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
"}}}
