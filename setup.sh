#!/bin/bash

## build phase
## directly invoked when certs is not specified

build() {
	#########
	# Build #
	#########
	[ "$(cat /etc/group | grep $(logname) | grep -E 'docker|sudo' | wc -l)" -eq 0 ] && {
		echo "user must be member of either sudo or docker groups"
		exit 1
	}
	docker-compose build
}

[ ! "$1" = "certs" ] && {
	build
	exit 0
}

## certs phase
## invoked when certs is specified

WORKDIR=$(dirname $0)
########
# VARS #
########
CANAME=pinqubator-ca
PASSWORD_CA=$(openssl rand -base64 32)

###########
# CA Cert #
###########
CA_DIR=$WORKDIR/ca
mkdir -p $CA_DIR/{requests,certificates,extensions,keys}
openssl genrsa \
	-des3 \
	-passout pass:$PASSWORD_CA \
	-out $CA_DIR/$CANAME.key 2048
openssl req \
	-x509 -new -nodes \
	-passin pass:$PASSWORD_CA \
	-key $CA_DIR/$CANAME.key \
	-sha256 -days 365 \
	-subj '/C=IT/ST=Brescia/L=Sirmione/O=A Mountain Ram & Co./OU=pinqubator-ca/CN=PinQubator' \
	-out $CA_DIR/$CANAME.pem

create_certs() {
	#############
	# Site Cert #
	#############
	PASSWORD_SITE=$(openssl rand -base64 32)
	openssl genrsa \
		-des3 \
		-passout pass:$PASSWORD_SITE \
		-out $CA_DIR/keys/$1.key 2048
	openssl req \
		-new -key $CA_DIR/keys/$1.key \
		-passin pass:$PASSWORD_SITE \
		-subj '/C=IT/ST=Brescia/L=Sirmione/O=A Mountain Ram & Co./OU=pinqubator/CN=PinQubator' \
		-out $CA_DIR/requests/$1.csr
	cat <<EOF >$CA_DIR/extensions/$1.ext
	authorityKeyIdentifier=keyid,issuer
	basicConstraints=CA:FALSE
	keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
	subjectAltName = @alt_names
	[alt_names]
	DNS.1 = $1
	DNS.2 = www.$1
EOF
	openssl x509 \
		-req -in $CA_DIR/requests/$1.csr \
		-passin pass:$PASSWORD_CA \
		-CA $CA_DIR/$CANAME.pem \
		-CAkey $CA_DIR/$CANAME.key \
		-out $CA_DIR/certificates/$1.crt \
		-days 365 -sha256 \
		-CAcreateserial \
		-extfile $CA_DIR/extensions/$1.ext
	cp $CA_DIR/certificates/$1.crt $CA_DIR/keys/$1.key $2
	echo -n "$PASSWORD_SITE" >$2/ssl_passwords.txt
	cp $CA_DIR/$CANAME.pem $3
}

### nginx
SSL_CONTEXT="$WORKDIR/reverse-proxy/conf/ssl"
NAME=pinqubator.com
[ -d $SSL_CONTEXT ] && { rm -rf $SSL_CONTEXT/*; }
create_certs $NAME $SSL_CONTEXT $WORKDIR
### backend
SSL_NGINX_CONTEXT=$SSL_CONTEXT
SSL_CONTEXT="$WORKDIR/backend/ssl"
NAME=backend.pinqubator.com
[ -d $SSL_CONTEXT ] && { rm -rf $SSL_CONTEXT/*; }
create_certs $NAME $SSL_CONTEXT $SSL_NGINX_CONTEXT

rm -r $CA_DIR

### build
build
