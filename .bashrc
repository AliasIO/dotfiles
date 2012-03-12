[ -z "$PS1" ] && return

# Color mapping
grey='\[\033[1;30m\]'
red='\[\033[0;31m\]'
RED='\[\033[1;31m\]'
green='\[\033[0;32m\]'
GREEN='\[\033[1;32m\]'
yellow='\[\033[0;33m\]'
YELLOW='\[\033[1;33m\]'
purple='\[\033[0;35m\]'
PURPLE='\[\033[1;35m\]'
white='\[\033[0;37m\]'
WHITE='\[\033[1;37m\]'
blue='\[\033[0;34m\]'
BLUE='\[\033[1;34m\]'
cyan='\[\033[0;36m\]'
CYAN='\[\033[1;36m\]'
NC='\[\033[0m\]'

PS1="$PURPLE\u@\h:\w$NC# "

alias ls='ls --color=auto'
alias ll='ls -l --color=auto'
alias la='ls -la --color=auto'
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

fortune #| cowsay
echo
