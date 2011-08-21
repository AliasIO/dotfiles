#!/bin/bash

BASEDIR=$(dirname $0)

USERPASS=`cat $BASEDIR/gmail_userpass`

PREV_UNREAD=0

while [ true ]
do
	UNREAD=`curl -su $USERPASS https://mail.google.com/mail/feed/atom/unread | grep -o '<fullcount>[0-9]' | cut -c12-99`

	if [ $UNREAD -gt $PREV_UNREAD ]
	then
		DISPLAY=:0.0 notify-send -i $BASEDIR/gmail.png Gmail "New e-mail: $UNREAD unread"

		PREV_UNREAD=$UNREAD
	fi

	sleep 10
done
