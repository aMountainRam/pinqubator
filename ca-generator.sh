#!/bin/bash
NAME=pinqubator.com
CANAME="$NAME-ca"
WORKDIR=$(pwd)/ca

[ -d "$WORKDIR" ] && { echo "directory $WORKDIR already exists. Remove to generate new ca"; exit 1; }

mkdir -p $WORKDIR/{keys,certificates,requests,extensions};
echo "STEP 1: create CA key"
openssl genrsa -des3 -out $WORKDIR/$CANAME.key 2048
echo "STEP 2: create CA pub key"
openssl req -x509 -new -nodes -key $WORKDIR/$CANAME.key -sha256 -days 365 -out $WORKDIR/$CANAME.pem
echo "STEP 3: create website key"
openssl genrsa -out $WORKDIR/keys/$NAME.key 2048
echo "STEP 4: set extensions file"
>$WORKDIR/extensions/$NAME.ext cat <<-EOF
	authorityKeyIdentifier=keyid,issuer
	basicConstraints=CA:FALSE
	keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
	subjectAltName = @alt_names
	[alt_names]
	DNS.1 = $NAME
	DNS.2 = www.$NAME
EOF
echo "STEP 5: create request"
openssl req -new -key $WORKDIR/keys/$NAME.key -out $WORKDIR/requests/$NAME.csr
echo "STEP 6: sign request"
openssl x509 -req -in $WORKDIR/requests/$NAME.csr -CA $WORKDIR/$CANAME.pem -CAkey $WORKDIR/$CANAME.key \
    -CAcreateserial -out $WORKDIR/certificates/$NAME.crt -days 365 -sha256 -extfile $WORKDIR/extensions/$NAME.ext