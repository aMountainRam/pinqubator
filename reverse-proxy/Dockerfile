FROM nginx:latest

COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./conf/ssl/pinqubator.com.crt /etc/ssl/certs/nginx/
COPY ./conf/ssl/pinqubator.com.key /etc/ssl/certs/nginx/
COPY ./conf/ssl/ssl_passwords.txt /var/lib/nginx/

