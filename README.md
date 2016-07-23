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

~~~TypeScript
import { EventEmitter } from 'typed-event-emitter';

class MyClass extends EventEmitter {
  onValueChanged = this.registerEvent<(newValue: number) => any>();
  
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

let instance = new MyClass();
instance.onValueChanged(newValue => {
  console.log(`Value changed: ${newValue}`);
});

instance.value = 27;
~~~

First, the *EventEmitter* is loaded from the module. Any class, that shall emit
events, must extend that *EventEmitter*. If your class has its own constructor,
make sure to call `super()`.

Any events, your class shall be able to emit, must be registered in the form:

~~~TypeScript
onFooBar = this.registerEvent<callbackType>();
~~~

Where `onFooBar` can be any name (it doesn't need to begin with *on*) and
`callbackType` must be the type of the function the listeners must have. With
this, you can see the signature your function must have when you're about to
bind a listener to that event.

To fire/emit an event (only possible from within your event emitter), you have
to call `this.emit(this.onFooBar, ...)`, where `this.onFooBar` is the event to
emit and `...` any number of parameters, that will be passed to the listeners.


### JavaScript

Your JavaScript host (i.e., your browser, node.js, etc.) should support classes
and inheritance in order to work correctly. The code shown above can also be
written in JavaScript (node.js):

~~~JavaScript
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
 
let instance = new MyClass();
instance.onValueChanged(newValue => {
  console.log(`Value changed: ${newValue}`);
});
 
instance.value = 27;
~~~

Node that the events are registered explicitly within the constructor. Make sure
to initialize them *after* calling `super()`.


## License

typed-event-emitter is licensed under the MIT License.