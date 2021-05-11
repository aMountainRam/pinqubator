FROM nginx:latest

COPY ./conf/includes/mime.types /etc/nginx/includes/mime.types
COPY ./conf/includes/proxy.conf /etc/nginx/includes/proxy.conf
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./conf/ssl/pinqubator.com.crt /etc/ssl/certs/nginx/
COPY ./conf/ssl/pinqubator.com.key /etc/ssl/certs/nginx/
COPY ./conf/ssl/pinqubator-ca.pem /etc/ssl/certs/nginx/
COPY ./conf/ssl/ssl_passwords.txt /var/lib/nginx/

