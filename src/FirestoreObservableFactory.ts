import { FirestoreAutoObservable } from './FirestoreAutoObservable';
import firestore from 'firebase/firestore';

export class FirestoreObservableFactory {
  private _name: string = 'StoreFactory';
  private stores: Map<string, FirestoreAutoObservable<any>>;

  get name(): string {
    return this._name;
  }

  constructor(name: string) {
    this._name = name;
    this.stores = new Map();
  }

  public getOrCreateStore<
    T,
    F extends firestore.Query | firestore.DocumentReference
  >(key: string, query?: F): FirestoreAutoObservable<T> {
    if (!this.stores.has(key) && query) {
      const sovereign = new FirestoreAutoObservable<T>(query);
      this.stores.set(key, sovereign);
    }

    const store = this.stores.get(key) as FirestoreAutoObservable<T>;
    return store;
  }
}
