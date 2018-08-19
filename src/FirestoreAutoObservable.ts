import { AutoObservable } from './AutoObservable';
import { firestore } from 'firebase';

type Flatten<T> = T extends any[] ? T[number] : T;

export class FirestoreAutoObservable<
  T extends any | any[]
> extends AutoObservable<T> {
  private unsubscriber?: () => void;
  private fsRef: firestore.Query | firestore.DocumentReference;

  constructor(fsRef: firestore.Query | firestore.DocumentReference) {
    super(
      () => {
        console.log('Opening FS AutoObservable');
        this._isLoading = true;
        this.unsubscriber = (this.fsRef as firestore.Query).onSnapshot(
          this.setSnapshot.bind(this)
        );
      },
      () => {
        console.log('Closing FS AutoObservable');
        if (this.unsubscriber) {
          this.unsubscriber();
        }
        this.unsubscriber = undefined;
      }
    );

    this.fsRef = fsRef;
  }

  public setSnapshot(
    snapshot: firestore.QuerySnapshot | firestore.DocumentSnapshot
  ) {
    this._data = this.getDataFromSnapshot(snapshot);
    this._isLoading = false;
  }

  private getDataFromSnapshot(
    snapshot: firestore.QuerySnapshot | firestore.DocumentSnapshot
  ): T {
    if ((snapshot as firestore.QuerySnapshot).docs) {
      const dataArray = (snapshot as firestore.QuerySnapshot).docs.map(doc =>
        mapDocToPayload(doc)
      ) as Flatten<T>;
      return dataArray;
    } else {
      const data = mapDocToPayload(snapshot as firestore.DocumentSnapshot);
      return data as Flatten<T>;
    }
  }
}

export function mapDocToPayload(doc: firestore.DocumentSnapshot) {
  return {
    ...doc.data(),
    requestContext: {
      ...doc,
      data: undefined
    }
  };
}
