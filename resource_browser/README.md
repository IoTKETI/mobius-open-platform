# Install 

## Install bower (if you did not install)
resmon> npm install bower -g 

## Install npm libraries
resmon> npm install

## Move to public (contains front end code) directory 
resmon> cd public

## Install bower libraries
resmon\public> bower install

## Move back to parent directory and start server application
resmon\public> cd ..

resmon> npm start

# Test 
browser 창에서  http://localhost:7575 

# Remark

## When you want to access locally installed Mobius server

Modify source code like below

### source code :

public/app/controller.controlpanel.js : 67

### changes :

[from]        

$scope.resourceHostList = ['http://203.253.128.161:7579', 'http://203.253.128.151:7579'];

[to]        

$scope.resourceHostList = ['http://localhost:7579', 'http://203.253.128.161:7579', 'http://203.253.128.151:7579'];
