# Installing

## Server:
Install mongodb  
Install Python3  
Install pipenv  

```sh
$ pipenv install
```

## Client:
Install node  
Install yarn  

```sh
$ cd ./client
$ yarn install
```

# Setup:

## Server:
Create ./.env file with the following:  
```
JWT_SECRET_KEY=secret
MONGODB_URI=gloomhavenguides
```

# Running:

## Server:
```sh
$ mongod
$ python3 ./run.py
```

## Client:
```sh
$ cd ./client
$ yarn start
```

Use the url given by running the client.  
Server will serve built client files while the client will hot reload on client source file changes.  
