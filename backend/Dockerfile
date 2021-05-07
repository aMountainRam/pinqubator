FROM node:14
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm i
ARG dbhost
ARG dbport
ENV DBHOST=${dbhost}
ENV DBPORT=${dbport}
COPY . .
COPY ./build .
RUN chmod +x ./*.sh
EXPOSE 8443
ENTRYPOINT ["./run.sh"]