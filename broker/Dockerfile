FROM rabbitmq:latest
COPY ./rabbitmq.conf /etc/rabbitmq
COPY ./conf.sh /etc/ssl
COPY ./ssl/broker.pinqubator.com.crt /etc/ssl/certs
COPY ./ssl/pinqubator-ca.pem /etc/ssl/certs
COPY ./ssl/broker.pinqubator.com.key /etc/ssl/broker.pinqubator.com.key.pem
COPY ./ssl/ssl_passwords.txt /etc/ssl
RUN chmod -R +r /etc/ssl
WORKDIR /etc/ssl
RUN chmod +x ./conf.sh
RUN /bin/bash ./conf.sh
