import { FirestoreAutoObservable } from '../src/FirestoreAutoObservable';
import { autorun } from 'mobx';
import { firestore } from 'firebase';

const mockFirestoreAutoObservable: any = {
  onSnapshot: jest.fn()
};

let fsSovereign: FirestoreAutoObservable<number>;

describe('FirestoreAutoObservable', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fsSovereign = new FirestoreAutoObservable<number>(
      mockFirestoreAutoObservable as firestore.Query
    );
  });

  it('Does not become observed from non-observer access', () => {
    const x = fsSovereign.data;
    expect(mockFirestoreAutoObservable.onSnapshot.mock.calls.length).toBe(0);
  });

  it('Does become observed from observer access', () => {
    autorun(() => {
      const x = fsSovereign.data;
    });
    expect(mockFirestoreAutoObservable.onSnapshot.mock.calls.length).toBe(1);
  });

  it('Becomes unobserved after observer closes', () => {
    const fsClose = jest.fn();
    mockFirestoreAutoObservable.onSnapshot.mockImplementation(() => fsClose);
    const close = autorun(() => {
      const x = fsSovereign.data;
    });
    close();

    expect(mockFirestoreAutoObservable.onSnapshot.mock.calls.length).toBe(1);
    expect(close.$mobx.isDisposed).toBeTruthy();
    expect(fsClose.mock.calls.length).toBe(1);
  });
});
