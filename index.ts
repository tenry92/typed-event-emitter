/******************************************************************************
 * The MIT License (MIT)                                                      *
 *                                                                            *
 * Copyright (c) 2016 Simon "Tenry" Burchert                                  *
 *                                                                            *
 * Permission is hereby granted, free of charge, to any person obtaining a    *
 * copy of this software and associated documentation files (the "Software"), *
 * to deal in the Software without restriction, including without limitation  *
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,   *
 * and/or sell copies of the Software, and to permit persons to whom the      *
 * Software is furnished to do so, subject to the following conditions:       *
 *                                                                            *
 * The above copyright notice and this permission notice shall be included in *
 * all copies or substantial portions of the Software.                        *
 *                                                                            *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,   *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL    *
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING    *
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER        *
 * EALINGS IN THE SOFTWARE.                                                   *
 ******************************************************************************/

type EventHandler<Args extends any[]> = (...args: Args) => void;
type EventBinder<Args extends any[]> = (event: EventHandler<Args>) => Listener;

export class EventEmitter {
  private eventListeners: Map<Function, Function[]>;
  
  constructor() {
    this.eventListeners = new Map();
  }
  
  on<Args extends any[]>(event: EventBinder<Args>, listener: EventHandler<Args>) {
    if(!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [ listener ]);
    } else {
      this.eventListeners.get(event).push(listener);
    }
    
    return new Listener(this, event, listener);
  }
  
  addListener<Args extends any[]>(event: EventBinder<Args>, listener: EventHandler<Args>) {
    return this.on(event, listener);
  }
  
  removeListener();
  removeListener(id: Listener);
  removeListener(event: Function, listener?: Function);
  
  removeListener() {
    if(arguments.length == 0) {
      this.eventListeners.clear();
    } else if(arguments.length == 1 && typeof arguments[0] == 'object') {
      let id = arguments[0];
      this.removeListener(id.event, id.listener);
    } else if(arguments.length >= 1) {
      let event = <Function>arguments[0];
      let listener = <Function>arguments[1];
      
      if(this.eventListeners.has(event)) {
        var listeners = this.eventListeners.get(event);
        var idx;
        while(!listener || (idx = listeners.indexOf(listener)) != -1) {
          listeners.splice(idx, 1);
        }
      }
    }
  }
  
  /**
   * Emit event. Calls all bound listeners with args.
   */
  protected emit<Args extends any[]>(event: EventBinder<Args>, ...args: Args) {
    if(this.eventListeners.has(event)) {
      for(var listener of this.eventListeners.get(event)) {
        listener(...args);
      }
    }
  }
  
  /**
   * @typeparam T The event handler signature.
   */
  registerEvent<T extends EventHandler<any[]>>() {
    const eventBinder = (handler: T): Listener => {
      return this.addListener(eventBinder, handler);
    };
    
    return eventBinder;
  }
}

export class Listener {
  constructor(public owner: EventEmitter,
    public event: Function,
    public listener: Function) {
    
  }
  
  unbind() {
    this.owner.removeListener(this);
  }
}
