#!/bin/bash

####################
# Global Variables #
####################
WORKDIR=$(dirname $0)
CANAME=pinqubator-ca
CA_DIR=$WORKDIR/ca
generate_password() {
	openssl rand -base64 29 | tr -d "=+/" | cut -c1-25
}
PASSWORD_CA=$(generate_password)

###########
# CA Cert #
###########
create_ca() {
	[ -d $CA_DIR ] && { rm -r $CA_DIR; }
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
}

#############
# Site Cert #
#############
create_certs() {
	PASSWORD_SITE=$(generate_password)
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
}

create_certs_no_passphrase() {
	openssl genrsa \
		-out $CA_DIR/keys/$1.key 2048
	openssl req \
		-new -key $CA_DIR/keys/$1.key \
		-subj '/C=IT/ST=Brescia/L=Sirmione/O=A Mountain Ram & Co./OU=pinqubator/CN=PinQubator' \
		-out $CA_DIR/requests/$1.csr
	cat <<EOF >$CA_DIR/extensions/$1.ext
$SUBJECT
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
extendedKeyUsage = clientAuth,serverAuth
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
	echo -n "" >$2/ssl_passwords.txt
}

set_root_ca() {
	for arg in ${@:1}; do
		cp $CA_DIR/$CANAME.pem $arg
	done
}

make_certs() {
	SSL_NGINX_CONTEXT="$WORKDIR/reverse-proxy/conf/ssl"
	SSL_BACKEND_CONTEXT="$WORKDIR/backend/ssl"
	SSL_FRONTEND_CONTEXT="$WORKDIR/frontend/conf/ssl"
	SSL_BROKER_CONTEXT="$WORKDIR/broker/ssl"
	SSL_DB_CONTEXT="$WORKDIR/instants-db/ssl"
	mkdir -p $SSL_NGINX_CONTEXT \
		$SSL_BACKEND_CONTEXT $SSL_FRONTEND_CONTEXT \
		$SSL_BROKER_CONTEXT $SSL_DB_CONTEXT;
	NAME=pinqubator.com
	### nginx
	[ -d $SSL_NGINX_CONTEXT ] && { rm -rf $SSL_NGINX_CONTEXT/*; }
	create_certs $NAME $SSL_NGINX_CONTEXT
	### backend
	[ -d $SSL_BACKEND_CONTEXT ] && { rm -rf $SSL_BACKEND_CONTEXT/*; }
	create_certs backend.$NAME $SSL_BACKEND_CONTEXT
	### frontend
	[ -d $SSL_FRONTEND_CONTEXT ] && { rm -rf $SSL_FRONTEND_CONTEXT/*; }
	create_certs frontend.$NAME $SSL_FRONTEND_CONTEXT
	### broker
	[ -d $SSL_BROKER_CONTEXT ] && { rm -rf $SSL_BROKER_CONTEXT/*; }
	create_certs broker.$NAME $SSL_BROKER_CONTEXT
	### instants-db
	[ -d $SSL_DB_CONTEXT ] && { rm -rf $SSL_DB_CONTEXT/*; }
	create_certs_no_passphrase instants-db.$NAME $SSL_DB_CONTEXT
	### mongo has troubles with a private key with passphrase
	cat $SSL_DB_CONTEXT/instants-db.$NAME.crt $SSL_DB_CONTEXT/instants-db.$NAME.key >$SSL_DB_CONTEXT/certificate.pem
	rm $SSL_DB_CONTEXT/instants-db.$NAME.crt $SSL_DB_CONTEXT/instants-db.$NAME.key

	set_root_ca $WORKDIR $SSL_NGINX_CONTEXT $SSL_BACKEND_CONTEXT $SSL_BROKER_CONTEXT $SSL_DB_CONTEXT $SSL_FRONTEND_CONTEXT
}

#########
# Build #
#########
build() {
	[ "$(cat /etc/group | grep $(logname) | grep -E 'docker|sudo' | wc -l)" -eq 0 ] && {
		echo "user must be member of either sudo or docker groups"
		exit 1
	}
	docker-compose build
}

GO=false
MAKE_BUILD=true
MAKE_CERTS=false
REMOVE_CA=true
LAUNCH_STOP=false
for arg in "$@"; do
	case $arg in
	"go")
		GO=true
		;;
	"certs")
		MAKE_CERTS=true
		;;
	"--no-build")
		MAKE_BUILD=false
		;;
	"keepCA")
		REMOVE_CA=false
		;;
	"stop")
		LAUNCH_STOP=true
		echo "stopping... other arguments are ignored"
		;;
	*)
		echo "cannot parse invalid argument $arg"
		;;
	esac
done

if [ "$GO" = true ]; then
	create_ca
	make_certs
	if [ "$REMOVE_CA" = true ]; then
		[ -d $CA_DIR ] && { rm -r $CA_DIR; }
	fi
	export HTTP_PORT=80;
	export HTTPS_PORT=443;
	docker-compose up --build -d
	exit 0;
fi

if [ "$LAUNCH_STOP" = true ]; then
	docker-compose down
	exit 0
fi
if [ "$MAKE_CERTS" = true ]; then
	create_ca
	make_certs
fi
if [ "$REMOVE_CA" = true ]; then
	[ -d $CA_DIR ] && { rm -r $CA_DIR; }
fi
if [ "$MAKE_BUILD" = true ]; then
	build
fi
