/******************************************************************************
 * ISC License                                                                *
 *                                                                            *
 * Copyright (c) 2016, Simon "Tenry" Burchert                                 *
 *                                                                            *
 * Permission to use, copy, modify, and/or distribute this software for any   *
 * purpose with or without fee is hereby granted, provided that the above     *
 * copyright notice and this permission notice appear in all copies.          *
 *                                                                            *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES   *
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF           *
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR    *
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES     *
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN      *
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR *
 * IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.                *
 ******************************************************************************/

export class EventEmitter {
  private eventListeners: Map<Function, Function[]>;
  
  constructor() {
    this.eventListeners = new Map();
  }
  
  on(event: Function, listener: Function) {
    if(!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [ listener ]);
    } else {
      this.eventListeners.get(event).push(listener);
    }
    
    return new Listener(this, event, listener);
  }
  
  addListener(event: Function, listener: Function) {
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
  protected emit(event: Function, ...args) {
    if(this.eventListeners.has(event)) {
      for(var listener of this.eventListeners.get(event)) {
        listener(...args);
      }
    }
  }
  
  /**
   * @typeparam T The event handler signature.
   */
  registerEvent<T extends Function>() {
    let eventBinder = (handler: T) => {
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
