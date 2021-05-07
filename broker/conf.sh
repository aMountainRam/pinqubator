#!/bin/bash
FILE=/etc/ssl/ssl_passwords.txt
[ ! -f $FILE ] && {
    echo "$FILE do not exists"
    exit 1
}
PASSWORD=$(cat $FILE)
CONFIG_FILE=/etc/rabbitmq/rabbitmq.conf
cat <<EOF >>$CONFIG_FILE
### secret key passphrase
ssl_options.password = $PASSWORD
EOF
