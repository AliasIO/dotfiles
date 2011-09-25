[ -z "$PS1" ] && return

PS1='\[\e[1;32m\]\u\[\e[1;37m\]@\[\e[1;32m\]\h\[\e[1;37m\]:\[\e[1;32m\]\W\[\e[1;37m\]\$\[\e[0m\] '

alias ls='ls --color=auto'
alias grep='grep --color=auto'

bind 'set editing-mode vi'
bind 'set keymap vi'
bind 'set mark-directories on'
bind 'set mark-symlinked-directories on'
bind 'set page-completions off'
bind 'set show-all-if-ambiguous on'
bind 'set completion-prefix-display-length 2'
bind 'set completion-query-items 500'
bind 'set visible-stats on'

export HISTSIZE=1000
export HISTFILESIZE=1000
export EDITOR=vim

fortune | cowsay
