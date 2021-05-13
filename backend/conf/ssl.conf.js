import fs from "fs";
export default {
    key: fs.readFileSync("ssl/backend.pinqubator.com.key"),
    cert: fs.readFileSync("ssl/backend.pinqubator.com.crt"),
    ca: fs.readFileSync("ssl/pinqubator-ca.pem"),
    passphrase: fs.readFileSync("ssl/ssl_passwords.txt").toString(),
    sslValidate: false, // in case of tests and dev environment, the db
    // is bridged on localhost:27017 while certificate
    // yields instants-db.pinqubator.com
};