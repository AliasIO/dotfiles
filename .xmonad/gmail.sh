#!/bin/bash

BASEDIR=$(dirname $0)

USERPASS=`cat $BASEDIR/gmail_userpass`

UNREAD=`curl -su $USERPASS https://mail.google.com/mail/feed/atom/unread | grep -o '<fullcount>[0-9]' | cut -c12-99`

if [ $UNREAD -gt 0 ]
then
	echo "| <fc=#9F0>$UNREAD UNREAD EMAIL</fc> "
fi
