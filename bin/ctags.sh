#!/bin/bash

dir='/home/elbert/www/'

for file in `find $dir -mindepth 1 -maxdepth 2 -name tags -type f`
do
	/usr/bin/ctags -f $file \
    -h '.php' -R \
    --PHP-kinds=cfiv \
    --totals=yes \
    --tag-relative=yes \
    --PHP-kinds=cfiv \
    --regex-PHP='/(abstract)?\s+class\s+([^ ]+)/\2/c/' \
    --regex-PHP='/interface\s+([^ ]+)/\1/i/' \
    --exclude='*.js' \
    --exclude='.git'
done
