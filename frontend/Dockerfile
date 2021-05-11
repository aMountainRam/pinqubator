FROM node:latest as build
ARG https_port
ENV HTTPS_PORT=${https_port}

WORKDIR /app
COPY . .
RUN bash -c "echo -e \"\nREACT_APP_APIPORT=$HTTPS_PORT\"" >> ./.env
RUN cat ./.env
RUN yarn
RUN yarn build

# server
FROM nginx:latest
COPY --from=build /app/build/ /usr/share/nginx/html/
COPY ./conf/includes/mime.types /etc/nginx/includes/mime.types
COPY ./conf/includes/proxy.conf /etc/nginx/includes/proxy.conf
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./conf/ssl/frontend.pinqubator.com.crt /etc/ssl/certs/nginx/
COPY ./conf/ssl/frontend.pinqubator.com.key /etc/ssl/certs/nginx/
COPY ./conf/ssl/pinqubator-ca.pem /etc/ssl/certs/nginx/
COPY ./conf/ssl/ssl_passwords.txt /var/lib/nginx/
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]