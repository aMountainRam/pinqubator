#!/bin/bash
WORKDIR=`dirname $0`;
SSL_CONTEXT="$WORKDIR/reverse-proxy/conf/ssl";
[ -d $SSL_CONTEXT ] && { rm -rf $SSL_CONTEXT/*; }
########
# VARS #
########
CANAME=pinqubator-ca;
NAME=pinqubator.com;
PASSWORD_CA=`openssl rand -base64 32`;
PASSWORD_SITE=`openssl rand -base64 32`;
###########
# CA Cert #
###########
CA_DIR=$WORKDIR/ca;
mkdir -p $CA_DIR/{requests,certificates,extensions,keys};
openssl genrsa \
	-des3 \
	-passout pass:$PASSWORD_CA \
	-out $CA_DIR/$CANAME.key 2048;
openssl req \
	-x509 -new -nodes \
	-passin pass:$PASSWORD_CA \
	-key $CA_DIR/$CANAME.key \
	-sha256 -days 365 \
	-subj '/C=IT/ST=Brescia/L=Sirmione/O=A Mountain Ram & Co./OU=pinqubator-ca/CN=PinQubator' \
	-out $CA_DIR/$CANAME.pem;
#############
# Site Cert #
#############
openssl genrsa \
	-des3 \
	-passout pass:$PASSWORD_SITE \
	-out $CA_DIR/keys/$NAME.key 2048;
openssl req \
	-new -key $CA_DIR/keys/$NAME.key \
	-passin pass:$PASSWORD_SITE \
	-subj '/C=IT/ST=Brescia/L=Sirmione/O=A Mountain Ram & Co./OU=pinqubator/CN=PinQubator' \
	-out $CA_DIR/requests/$NAME.csr;
cat <<EOF > $CA_DIR/extensions/$NAME.ext
	authorityKeyIdentifier=keyid,issuer
	basicConstraints=CA:FALSE
	keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
	subjectAltName = @alt_names
	[alt_names]
	DNS.1 = $NAME
	DNS.2 = www.$NAME
EOF
openssl x509 \
	-req -in $CA_DIR/requests/$NAME.csr \
	-passin pass:$PASSWORD_CA \
	-CA $CA_DIR/$CANAME.pem \
	-CAkey $CA_DIR/$CANAME.key \
	-out $CA_DIR/certificates/$NAME.crt \
	-days 365 -sha256 \
	-CAcreateserial \
	-extfile $CA_DIR/extensions/$NAME.ext;
cp $CA_DIR/certificates/$NAME.crt $CA_DIR/keys/$NAME.key $SSL_CONTEXT;
echo -n "$PASSWORD_SITE" > $SSL_CONTEXT/ssl_passwords.txt;
cp $CA_DIR/$CANAME.pem $WORKDIR;
rm -r $CA_DIR;
#########
# Build #
#########
[ "$(cat /etc/group | grep `logname` | grep -E 'docker|sudo' | wc -l)" -eq 0 ] && { echo "user must be member of either sudo or docker groups"; exit 1; }
docker-compose build;