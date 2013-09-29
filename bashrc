dull=0
bright=1

fg_black=30
fg_red=31
fg_green=32
fg_yellow=33
fg_blue=34
fg_violet=35
fg_cyan=36
fg_white=37

fg_null=00

bg_black=40
bg_red=41
bg_green=42
bg_yellow=43
bg_blue=44
bg_violet=45
bg_cyan=46
bg_white=47

bg_null=00

esc="\033"
normal="\[$esc[m\]"
reset="\[$esc[${dull};${fg_white};${bg_null}m\]"

black="\[$esc[${dull};${fg_black}m\]"
red="\[$esc[${dull};${fg_red}m\]"
green="\[$esc[${dull};${fg_green}m\]"
yellow="\[$esc[${dull};${fg_yellow}m\]"
blue="\[$esc[${dull};${fg_blue}m\]"
violet="\[$esc[${dull};${fg_violet}m\]"
cyan="\[$esc[${dull};${fg_cyan}m\]"
white="\[$esc[${dull};${fg_white}m\]"

bright_black="\[$esc[${bright};${fg_black}m\]"
bright_red="\[$esc[${bright};${fg_red}m\]"
bright_green="\[$esc[${bright};${fg_green}m\]"
bright_yellow="\[$esc[${bright};${fg_yellow}m\]"
bright_blue="\[$esc[${bright};${fg_blue}m\]"
bright_violet="\[$esc[${bright};${fg_violet}m\]"
bright_cyan="\[$esc[${bright};${fg_cyan}m\]"
bright_white="\[$esc[${bright};${fg_white}m\]"

PROMPT_COMMAND='export ERR=$?'

# don't put duplicate lines or lines starting with space in the history.
# See bash(1) for more options
HISTCONTROL=ignoreboth

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=99999
HISTFILESIZE=99999

# append to the history file, don't overwrite it
shopt -s histappend

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

function parse_git_branch
{
  ref=$(git symbolic-ref HEAD 2> /dev/null) || return

  echo " ("${ref#refs/heads/}")"
}

PS1="${bright_white}\u${normal}@${bright_white}\h${normal}:\w${bright_white}\$(parse_git_branch)${normal}\$ ${reset}"

alias ls='ls --color=auto'
alias grep='grep --color=auto'
alias ll='ls -l'
alias la='ls -A'

export PATH=$PATH:/home/elbert/apps/android/sdk/tools
export PATH=$PATH:/home/elbert/apps/android/sdk/platform-tools
export PATH=$PATH:/home/elbert/apps/android/sdk/build-tools
