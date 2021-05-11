FROM mongo:latest

RUN mkdir -p /etc/mongo
COPY ./mongo/mongod.conf /etc
COPY ./ssl/* /etc/ssl/
RUN chmod -R a+r /etc/ssl /etc/mongod.conf

ARG database
ARG username
ARG password
ENV MONGO_INITDB_DATABASE=${database}
ENV MONGO_INITDB_ROOT_USERNAME=${username}
ENV MONGO_INITDB_ROOT_PASSWORD=${password}
EXPOSE 27017
ENTRYPOINT ["/usr/bin/mongod", "--config", "/etc/mongod.conf"]