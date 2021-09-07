# typed-event-emitter

This module provides an alternative API than the well known event emitting
interfaces used in the browser (DOM) or node.js. Instead of accepting arbitrary
strings as the event name, this module forces you to register your events in
your class. Consequently, the style of binding and emitting events differs a
little bit, ensuring already at binding time that the events actually exists.


## Install

Via npm:

    $ npm install typed-event-emitter


## Usage
      
Take a look at the following snippet (TypeScript):

~~~ts
import { EventEmitter } from 'typed-event-emitter';

class MyClass extends EventEmitter {
  public readonly onValueChanged = this.registerEvent<[number]>();
  
  private _value: number;
  
  constructor(value: number) {
    // initialize EventEmitter
    super();
    
    this._value = value;
  }
  
  get value() {
    return this._value;
  }
  
  set value(value: number) {
    this._value = value;
    this.emit(this.onValueChanged, this._value);
  }
}

let instance = new MyClass(0);
instance.onValueChanged(newValue => {
  console.log(`Value changed: ${newValue}`);
});

instance.value = 27;
~~~

First, the *EventEmitter* is loaded from the module. Any class that shall emit
events must extend that *EventEmitter*. If your class has its own constructor,
make sure to call `super()`.

Any events your class shall be able to emit must be registered in the form:

~~~ts
onFooBar = this.registerEvent<callbackArgTypes>();
~~~

Where `onFooBar` can be any name (it doesn't need to begin with *on*) and
`callbackArgTypes` must be an array of the argument types the callback accepts.
With this, you can see the signature your function must have when you're about
to bind a listener to that event.

To fire/emit an event (only possible from within your event emitter), you have
to call `this.emit(this.onFooBar, ...)`, where `this.onFooBar` is the event to
emit and `...` any number of parameters that will be passed to the listeners.


### JavaScript

The code shown above can also be written in JavaScript (node.js):

~~~js
const EventEmitter = require('typed-event-emitter').EventEmitter;

class MyClass extends EventEmitter {
  constructor(value) {
    // initialize EventEmitter
    super();
    
    /* newValue: number */
    this.onValueChanged = this.registerEvent();
    
    this._value = value;
  }
  
  get value() {
    return this._value;
  }
  
  set value(value) {
    this._value = value;
    this.emit(this.onValueChanged, this._value);
  }
}
 
let instance = new MyClass(0);
instance.onValueChanged(newValue => {
  console.log(`Value changed: ${newValue}`);
});
 
instance.value = 27;
~~~

Note that the events are registered explicitly within the constructor. Make sure
to initialize them *after* calling `super()`.


## Changelog


### 3.0.0 (2021-09-07)

 - BREAKING CHANGE (TypeScript): `registerEvent<(arg: number) => any>()` now is
 `registerEvent<[number]>()`
 - Add unit tests (run `npm test`)

### 2.0.0 (2019-08-06)

 - Make methods more type safe. This is a breaking change if used in a TypeScript
 project (rather than plain JavaScript), as this requires TypeScript 3.0+.

### 1.1.0 (2018-10-01)

 - Add support for ES5.

### 1.0.0 (2016-07-18)

 - Initial release.


## License

typed-event-emitter is licensed under the MIT License.