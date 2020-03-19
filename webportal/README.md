Install guide
=============

## Table of Contents
1. Install Node.js
2. Install MongoDB
3. Install webportal application
4. Setting

## Install Node.js

1. Visit node.js homepage

   https://nodejs.org/ko/download/

2. Download & install
   1. Windows : Download Windows Installer (.msi) and double click it.
   1. Linux : Follow instructions on

      https://nodejs.org/ko/download/package-manager/




## Install MongoDB

1. Visit MongoDB homepage

   https://www.mongodb.com

2. Download MongoDB Community Server

   1. Windows : Download Windows installer and double click it.
      https://www.mongodb.com/download-center?jmp=nav#community

   2. Linux : Follow instructions on
      https://docs.mongodb.com/manual/administration/install-on-linux

   3. Start MongoDB

      ```
      sudo service mongod start
      ```

   5. Create admin user  (<<admin>>  / <<admin-password>>)

      ```
      mongo --port 27017
      ```

      ```
      use admin
      db.createUser(
        {
          user: "<<admin>>",
          pwd: "<<admin-password>>",
          roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
        }
      )
      ```

   3. Authorization config

      ```
      vi /etc/mongod.conf
      ```

      ```
      systemLog:
       destination: file
       path: /usr/local/var/log/mongodb/mongo.log
       logAppend: true
      storage:
       dbPath: /usr/local/var/mongodb
      net:
       #bindIp: 127.0.0.1
       bindIp: 0.0.0.0

      security:
       authorization: "enabled"
      ```

   3. Restart

      ```
      sudo service mongod restart
      ```

   4. Create user (mobius_webportal_user / tkdydwk12#$ )

      ```
      mongo --port 27017 -u "<<admin>>" -p "<<admin-password>>" --authenticationDatabase "admin"
      ```

      ```
      use mobius_webportal
      db.createUser(
        {
          user: "mobius_webportal_user",
          pwd: "tkdydwk12#$",
          roles: [ { role: "readWrite", db: "mobius_webportal" } ,
          { role: "dbAdmin", db: "mobius_webportal" }
          ]
        }
      )
      ```

### Setting ###
   1. Open {project location}/bin/config.json
      this file have enviornment configurations for this service

   2. Almost properties are good by default, but you have to make some properties

   3. look at the "google" property, these properties are necessary stuff for login through Google OAuth

         ```javascript
            "google" : {
               "client_id" : "",
               "clilent_secret" : "",
            }
         ```
      
   4. You have to make Credentials in Google Cloud Platform and please write 'Client ID' and 'Client secret'
      If you don't write these properties, you can't use Google OAuth Login service

   ※ Google Credentials guide is here https://drive.google.com/file/d/1AXehZ5PA1SDp2oem_f_RNVnbJ3YbIN2o/view?usp=sharing