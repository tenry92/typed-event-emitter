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

/**
 * Generic for callback function with any arguments.
 */
type EventHandler<Args extends any[]> = (...args: Args) => void;

/**
 * Generic for function that accepts EventHandler (callback) and returns a new
 * instance of Listener.
 */
type EventBinder<Args extends any[]> = (event: EventHandler<Args>) => Listener;

export class EventEmitter {
  private eventListeners: Map<EventBinder<any>, EventHandler<any>[]>;

  public constructor() {
    this.eventListeners = new Map();
  }

  public addListener<Args extends any[]>(event: EventBinder<Args>, callback: EventHandler<Args>): Listener {
    if(!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [callback]);
    } else {
      this.eventListeners.get(event)!.push(callback);
    }
    
    return new Listener(this, event, callback);
  }

  /**
   * Alias for `addListener`.
   */
  public on<Args extends any[]>(event: EventBinder<Args>, callback: EventHandler<Args>): Listener {
    return this.on(event, callback);
  }

  /**
   * Remove all listeners.
   */
  public removeListener(): void;

  /**
   * Remove specific listener.
   *
   * @param listener Listener to remove.
   */
  public removeListener(listener: Listener): void;

  /**
   * Remove callback function from given event.
   *
   * @param event Event where function might have been added to
   * @param callback Callback function to remove from event
   */
  public removeListener(event: Function, callback?: Function): void;

  public removeListener() {
    if(arguments.length == 0) {
      // remove all event listeners
      this.eventListeners.clear();
    } else if(arguments.length == 1 && typeof arguments[0] == 'object') {
      // convert Listener {event, listener} to [event, listener]
      const listener = arguments[0] as Listener;
      this.removeListener(listener.event, listener.callback);
    } else if(arguments.length >= 1) {
      // removeListener(event, listener)
      const [event, listener] = Array.from(arguments) as [EventBinder<any>, EventHandler<any>];

      if(this.eventListeners.has(event)) {
        let callbacks = this.eventListeners.get(event)!;
        callbacks = callbacks.filter(otherListener => listener != otherListener);
        this.eventListeners.set(event, callbacks);
      }
    }
  }

  /**
   * Emit event. Calls all bound listeners with args.
   */
  protected emit<Args extends any[]>(event: EventBinder<Args>, ...args: Args) {
    if(this.eventListeners.has(event)) {
      // copy array to allow removal of listeners within the callbacks
      const callbacks = [...this.eventListeners.get(event)!];

      for(const callback of callbacks) {
        callback(...args);
      }
    }
  }
  
  /**
   * @typeparam T The event handler signature.
   */
  public registerEvent<T extends any[]>() {
    const eventBinder = (handler: EventHandler<T>): Listener => {
      return this.addListener(eventBinder, handler);
    };
    
    return eventBinder;
  }
}

export class Listener {
  public constructor(public owner: EventEmitter,
    public event: Function,
    public callback: Function) {}

  public unbind() {
    this.owner.removeListener(this);
  }
}
