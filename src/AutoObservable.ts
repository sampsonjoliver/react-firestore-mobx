import { onBecomeObserved, onBecomeUnobserved } from 'mobx';
import { observable, decorate } from 'mobx';

export class AutoObservable<T> {
  public _data: T | null;
  public _isLoading: boolean;

  get data() {
    return this._data;
  }

  get isLoading() {
    return this._isLoading;
  }

  constructor(onObserved: () => void, onUnobserved: () => void) {
    this._data = null;
    this._isLoading = false;

    onBecomeObserved(this, '_data', onObserved);
    onBecomeUnobserved(this, '_data', onUnobserved);
    onBecomeObserved(this, '_isLoading', onObserved);
    onBecomeUnobserved(this, '_isLoading', onUnobserved);
  }
}

decorate(AutoObservable, {
  _data: observable,
  _isLoading: observable
});
