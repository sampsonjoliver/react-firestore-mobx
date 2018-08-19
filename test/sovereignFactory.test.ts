import { autorun, $mobx } from 'mobx';
import { firestore } from 'firebase';
import { FirestoreObservableFactory } from '../src/FirestoreObservableFactory';
import { FirestoreAutoObservable } from '../src/FirestoreAutoObservable';

let factory: FirestoreObservableFactory;
describe('Sovereign Factory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    factory = new FirestoreObservableFactory('');
  });

  it('Creates new sovereign when not exists', () => {
    const mockFirestoreQuery: any = { onSnapshot: jest.fn() };
    factory.getOrCreateStore('key', mockFirestoreQuery);

    expect(factory.getOrCreateStore('key')).toBeInstanceOf(
      FirestoreAutoObservable
    );
    expect(factory.getOrCreateStore('otherkey')).toBeUndefined();
  });

  it('Does become observed from observer access', () => {
    const mockFirestoreQuery: any = { onSnapshot: jest.fn() };
    const fsAutoObservable = factory.getOrCreateStore(
      'key',
      mockFirestoreQuery
    );
    autorun(() => {
      const x = fsAutoObservable.data;
    });
    expect(mockFirestoreQuery.onSnapshot.mock.calls.length).toBe(1);
  });

  it('Becomes unobserved after observer closes', () => {
    const fsClose = jest.fn();
    const mockFirestoreQuery: any = { onSnapshot: jest.fn() };
    mockFirestoreQuery.onSnapshot.mockImplementation(() => fsClose);
    const fsAutoObservable = factory.getOrCreateStore(
      'key',
      mockFirestoreQuery as firestore.Query
    );

    console.log('fsSovereign', fsAutoObservable);

    const close = autorun(() => {
      const x = fsAutoObservable.data;
    });
    close();

    expect(mockFirestoreQuery.onSnapshot.mock.calls.length).toBe(1);
    expect(close[$mobx].isDisposed).toBeTruthy();

    expect(fsClose.mock.calls.length).toBe(1);
  });
});
