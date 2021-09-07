import { describe } from 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';

import { EventEmitter, Listener } from '.';

describe('emit', function () {
  class MyClass extends EventEmitter {
    public readonly onMyEvent = this.registerEvent<[string]>();

    public emitMyEvent(value: string): void {
      this.emit(this.onMyEvent, value);
    }
  }

  it('should call 3 listeners in order', function () {

    // given
    const instance = new MyClass();
    const callback1 = sinon.fake();
    const callback2 = sinon.fake();
    const callback3 = sinon.fake();

    // when
    instance.onMyEvent(callback1);
    instance.onMyEvent(callback2);
    instance.onMyEvent(callback3);
    instance.emitMyEvent('event1');

    // then
    assert.isTrue(callback1.calledOnceWithExactly('event1'), 'expected callback1 to be called once with "event1"');
    assert.isTrue(callback2.calledOnceWithExactly('event1'), 'expected callback2 to be called once with "event1"');
    assert.isTrue(callback3.calledOnceWithExactly('event1'), 'expected callback3 to be called once with "event1"');

    assert.isTrue(callback2.calledAfter(callback1), 'expected callback2 to be called after callback1');
    assert.isTrue(callback3.calledAfter(callback2), 'expected callback3 to be called after callback2');
  });

  it('should call listeners multiple times', function () {
    // given
    const instance = new MyClass();
    const callback1 = sinon.fake();
    const callback2 = sinon.fake();

    // when
    instance.onMyEvent(callback1);
    instance.emitMyEvent('event1');
    instance.onMyEvent(callback2);
    instance.emitMyEvent('event2');

    // then
    assert.isTrue(callback1.calledWithExactly('event1'), 'expected callback1 to be called with "event1"');
    assert.isTrue(callback1.calledWithExactly('event2'), 'expected callback1 to be called with "event2"');
    assert.isTrue(callback2.calledOnceWithExactly('event2'), 'expected callback2 to be called once with "event2"');
  });

  describe('unbind listener within callback', function () {
    it('should remove listeners correctly', function () {
      // given
      const instance = new MyClass();
      let listener: Listener;
      const callback1 = sinon.fake(function () {
        listener.unbind();
      });
      const callback2 = sinon.fake();
  
      // when
      listener = instance.onMyEvent(callback1);
      const otherListener = instance.onMyEvent(callback2);
      instance.emitMyEvent('event1');
      instance.emitMyEvent('event2');
  
      // then
      assert.notStrictEqual(otherListener, listener);
      assert.strictEqual(callback1.callCount, 1, 'expected callback1 to be called once');
      assert.strictEqual(callback1.args[0][0], 'event1', 'expected callback1 to be called with "event1"');
      assert.strictEqual(callback2.callCount, 2, 'expected callback2 to be called twice');
    });
  });
});
