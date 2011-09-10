[ -z "$PS1" ] && return

PS1='\[\e[1;32m\]\u@\h\[\e[1;37m\]:\[\e[1;32m\]\W\[\e[1;37m\]\$\[\e[0m\] '

alias ls='ls --color=auto'
alias grep='grep --color=auto'

export HISTSIZE=1000
export HISTFILESIZE=1000
export EDITOR=vim
