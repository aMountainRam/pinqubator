# pinqubator 📷
a mobile app backend to create instants and upload photos

## 1. description 📓
PinQubator is made of 5 services running in independent containers on a docker-compose managed environment.
Such services are
1. reverse-proxy (nginx)
2. backend (NodeJS)
3. noSQL database (MongoDB)
4. message broker (RabbitMQ)
5. stub frontend (React)
The application is hence realized as a microservice compound which exposes a REST API on
> https://pinqubator.com/api

and a very simple frontend to test the backend
> https://pinqubator.com

*Core business* of this application is the upload/storage/retrieval of **Instants** which are made of
1. picture/image/photo
2. username
3. title
4. geolocation
5. timestamp

The API allows to *create* (POST /api/instants) and *retrieve* (GET /api/instants) or *retrieve by username* (GET /api/instants/:username)
such instants, ordered by timestamp decreasing.

The picture uploaded with the instant is always resized when either dimension is larger then 140px.

The resize is done in asynchronous fashion
by the sequence
**i.** POST request
**ii.** check the size of the picture
**iii.** job id and image buffer sent by publisher to broker
**iv.** backend consumer takes care of the job
**v.** backend stores the image on the corresponding instant

## 2. networking & https settings 🌐
### 2.1 security 👮‍♂️
The whole network runs in **https**, internal routing included, considering the *trust-no-one* pattern.
On setup a Certificate Authority is created, signs certificates for each service, provides the user with a signed
PEM certificate and it is then deleted (there's a script option to avoid deletion of such CA).

Given that, backend and DB don't need an authentication and they can cross validate x509 certificates and share a secret.

The same configuration could be available for RabbitMQ as well but was a bit out of scope.

To use the frontend properly, consider adding a name for your localhost by
(notice you'll need **docker**, **docker-compose**, **jq**, a user with sudo privileges and a user in the docker group):
1. retrieve docker bridge gateway
```console
$ DOCKER_GATEWAY=`docker network inspect bridge | jq '.[].IPAM.Config[].Gateway' | sed 's/"//g'`
```
2. append to /etc/hosts
```console
$ sudo echo "$DOCKER_GATEWAY pinqubator.com" >> /etc/hosts
```
### 2.2 network 🔗
A simple picture of the networking provided to the containers can be seen here:
```
                             ---- DB ----
                            |            |
                 ---- Backend            |
                |        |  |            |
                |        |   -- Broker --
User --> Reverse Proxy   |
                |        |
                 ---- Frontend
```
The application domain is *pinqubator.com* with services *https://backend.pinqubator.com:8443*, *amqps://broker.pinqubator.com:5671*,
*https://frontend.pinqubator.com:443* and *mongodb://instant-db.pinqubator.com:27017*.

Database is also bridged on *mongodb://root:qweasd@localhost:27017* and broker on *amqps://guest:guest@localhost:5671*

## 3. setup 🏁
Download this repo and ensure you have 'wrx' rights in the clone folder together with being a member of the docker group or a sudoer.
Be sure that
```console
$ chmod +x ./setup.sh
```
The setup and startup is provided out-of-the-box on bash scripts.
If you can bind on your local machine on port 80 and 443, just
```console
$ ./setup.sh go
```
if you cannot bind on 80/443 or you prefer to use other ports please run
```console
$ export HTTP_PORT=<http port>
$ export HTTPS_PORT=<https port>
$ ./setup.sh certs --no-build
$ docker-compose up --build -d
```
moreover you can keep the CA by setting
```console
$ ./setup.sh certs keepCA --no-build
```

The application should be up and running leaving you with the task of import the CA PEM certificate into your browser.
The certificate can be found, one setup is complete, in the clone directory as **pinqubator-ca.pem**.

To stop the system you can use either
```console
$ ./setup.sh stop
```
or
```console
$ docker-compose down
```

After setup a simple restart is always provided by
```console
$ docker-compose up -d
```

If a rebuild is need, there's no need to re-do the CA bootstrap and simply run
```console
./setup.sh && docker-compose up -d
```

Finally, DB storage is in a docker volume called *instants-volume* bound to */data/db*

## 4. Development setup ⛑️
To probe the application it is recommended to run in "dev mode". If the app is fully deployed, run
```console
$ docker-compose stop backend frontend reverse-proxy
```
or if it was previously stopped
```console
$ docker-compose up -d instants-db broker
```
### 4.1 DB 🥙
The instance of MongoDB has databases and collections dedicated to each environment:
1. instants-db (prod)
2. instants-db-dev (dev)
3. instants-db-test (test)

### 4.2 Backend in dev mode 🌥️
Be sure your port 8443 is free on localhost and go into
```console
$ cd ./backend
```
and install the npm packages
```console
$ npm i
```
then you can either run the application via
```console
$ npm run dev
```
or run tests
```console
$ npm test
```
Consider that some tests are integrated and won't work without DB connection and broker connection. A helper script is invoked to check whether those services are up and running otherwise tests are not performed.

To debug we provide the VSCode setting in "./.vscode"

### 4.3 Frontend in dev mode 😎
When the backend is in dev mode you can also run the frontend via
```console
$ cd ./frontend
$ npm i
$ npm start
```
and use as if it was in production.

## 5. Arch. Patterns
The backend has been built on the standard pattern MVC. The application bootstrap mimics IoC concepts by calling on "bean"
configurations (./backend/conf) of services (./backend/service),
which are almost singletons, instead of instantiating each time a service. Tests behave in the same way with a similar bootstrapping method.

There's then a single DB connection and a single broker connection incapsulated in an EventEmitter class extension.


Enjoy!!