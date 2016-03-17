# sails-hook-routefactory 

[![Build Status](https://travis-ci.org/dadleyy/sails-hook-routefactory.svg?branch=master)](https://travis-ci.org/dadleyy/sails-hook-routefactory) [![codecov.io](https://codecov.io/github/dadleyy/sails-hook-routefactory/coverage.svg?branch=master)](https://codecov.io/github/dadleyy/sails-hook-routefactory?branch=master)


A [sailsjs](http://sailsjs.org/) hook that allows a function under `sails.config.routefactory` to behave like [laravel's](https://laravel.com/docs/5.2/routing) routing engine.


### Installation

Installing custom hooks for a sailsjs application is done by installing their npm module as a dependency of the application. Sails picks up these special packages by looking for those modules having a `sails.isHook` property set to `true`. So, to start using this hook, just run

```
npm i sails-hook-routefactory --save
```

### Useage

The hook uses the `sails.config.routefactory` property, which can be set by creating a file underneath your application's `config` directory called `routefactory.js`. This file should look like this:


```javascript
module.exports.routefactory = function(factory) {

  factory.resource('user', 'UserController');

  factory.group('admin', function() {
    factory.get('/info', 'SystemController.diagnostics');

    factory.resource('/settings', 'SystemController', {except: ['findOne', 'destroy']});
  });

  factory.route('POST /logger', 'LoggerController.create');

};
```
