FROM node:14
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm i

# database vars
ARG dbhost
ARG dbport
ENV DBHOST=${dbhost}
ENV DBPORT=${dbport}

# database vars
ARG brokerhost
ARG brokerport
ENV BROKERHOST=${brokerhost}
ENV BROKERPORT=${brokerport}

ARG node_env
ENV DOTENV_CONFIG_PATH=./.env.${node_env}


COPY . .
COPY ./build .
RUN chmod +x ./*.sh
EXPOSE 8443
ENTRYPOINT ["./run.sh"]