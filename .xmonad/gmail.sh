#!/bin/bash

BASEDIR=$(dirname $0)

USERPASS=`cat $BASEDIR/gmail_userpass`

UNREAD=`curl -su $USERPASS https://mail.google.com/mail/feed/atom/unread | grep -o '<fullcount>[0-9]' | cut -c12-99`

if [ $UNREAD -gt 0 ]
then
	if [ $UNREAD -gt 1 ]
	then
		S="S"
	fi

	echo "| <fc=#FFF>$UNREAD UNREAD EMAIL$S</fc> "
fi
