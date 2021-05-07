FROM mongo:latest

ARG environment
RUN mkdir -p /etc/mongo
COPY ./mongo/${environment}.mongod.conf /etc/mongo/mongod.conf
COPY ./ssl/* /etc/ssl/
RUN chmod -R +r /etc/ssl /etc/mongo

ARG database
ARG username
ARG password

ENV MONGO_INITDB_DATABASE=${database}
ENV MONGO_INITDB_ROOT_USERNAME=${username}
ENV MONGO_INITDB_ROOT_PASSWORD=${password}

CMD [ "-f", "/etc/mongo/mongod.conf" ]