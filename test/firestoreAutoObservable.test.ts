import {
  FirestoreAutoObservable,
  mapDocToPayload
} from '../src/FirestoreAutoObservable';
import { autorun, $mobx } from 'mobx';
import { firestore } from 'firebase';

const mockFirestoreAutoObservableQuery: any = {
  onSnapshot: jest.fn()
};

describe('FirestoreAutoObservable', () => {
  describe('Observability', () => {
    let fsSovereign: FirestoreAutoObservable<number>;

    beforeEach(() => {
      jest.clearAllMocks();

      fsSovereign = new FirestoreAutoObservable<number>(
        mockFirestoreAutoObservableQuery as firestore.Query
      );
    });

    it('Does not become observed from non-observer access', () => {
      const x = fsSovereign.data;
      expect(
        mockFirestoreAutoObservableQuery.onSnapshot.mock.calls.length
      ).toBe(0);
    });

    it('Does become observed from observer access', () => {
      autorun(() => {
        const x = fsSovereign.data;
      });
      expect(
        mockFirestoreAutoObservableQuery.onSnapshot.mock.calls.length
      ).toBe(1);
    });

    it('Becomes unobserved after observer closes', () => {
      const fsClose = jest.fn();
      mockFirestoreAutoObservableQuery.onSnapshot.mockImplementation(
        () => fsClose
      );
      const close = autorun(() => {
        const x = fsSovereign.data;
      });
      close();

      expect(
        mockFirestoreAutoObservableQuery.onSnapshot.mock.calls.length
      ).toBe(1);
      expect(close[$mobx].isDisposed).toBeTruthy();
      expect(fsClose.mock.calls.length).toBe(1);
    });
  });

  describe('Snapshot data', () => {
    let fsSovereign: FirestoreAutoObservable<any>;

    beforeEach(() => {
      jest.clearAllMocks();

      fsSovereign = new FirestoreAutoObservable<any>(
        mockFirestoreAutoObservableQuery as firestore.Query
      );
    });

    it('Gets array of data from query snapshots', () => {
      const doc = { foo: 'bar' };
      const querySnapshot = ({
        docs: [{ data: () => doc }]
      } as any) as firestore.QuerySnapshot;

      fsSovereign.setSnapshot(querySnapshot);

      expect(fsSovereign.isLoading).toBe(false);
      expect(fsSovereign.data).toHaveLength(1);
      expect(fsSovereign.data[0].foo).toEqual(doc.foo);
    });

    it('Gets single doc from document snapshot', () => {
      const doc = { foo: 'bar' };
      const docSnapshot = ({
        data: () => doc
      } as any) as firestore.DocumentSnapshot;

      fsSovereign.setSnapshot(docSnapshot);

      expect(fsSovereign.isLoading).toBe(false);
      expect(fsSovereign.data.length).toBeUndefined();
      expect(fsSovereign.data.foo).toEqual(doc.foo);
    });
  });

  describe('doc mapper', () => {
    it('Maps to payload type', () => {
      const doc = { foo: 'bar' };
      const docSnapshot = ({
        data: () => doc,
        meta: 'any'
      } as any) as firestore.DocumentSnapshot;

      const payload: any = mapDocToPayload(docSnapshot);

      expect(payload.foo).toEqual(doc.foo);
      expect(payload.requestContext).toEqual({
        meta: 'any'
      });
    });
  });
});
