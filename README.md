# pinqubator
a mobile app backend to create instants and upload photos

## https settings
### add a host
need docker, jq, a user with sudo privileges and a user in the docker group
1. retrieve docker bridge gateway
```console
$ DOCKER_GATEWAY=`docker network inspect bridge | jq '.[].IPAM.Config[].Gateway' | sed 's/"//g'`
```
2. append to /etc/hosts
```console
$ sudo echo "$DOCKER_GATEWAY pinqubator.com" >> /etc/hosts
```
### import a ca-certificate in your browser
the certificate is pinqubator.com-ca.pem

## run
from the main folder (80 and 443 must be free)
```console
$ docker-compose up -d
```

## startup
```console
export HTTP_PORT=80
export HTTPS_PORT=433
./setup.sh certs --no-build
docker-compose up --build -d
```
```console
./setup.sh go
```
