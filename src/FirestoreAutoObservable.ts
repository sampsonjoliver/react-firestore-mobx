import { AutoObservable } from './AutoObservable';
import firestore from 'firebase/firestore';

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
          snapshot => {
            this._data = this.getDataFromSnapshot(snapshot);
            this._isLoading = false;
          }
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

  private getDataFromSnapshot(
    snapshot: firestore.QuerySnapshot | firestore.DocumentSnapshot
  ): T {
    if ((snapshot as firestore.QuerySnapshot).docs) {
      return (snapshot as firestore.QuerySnapshot).docs.map(doc =>
        doc.data()
      ) as Flatten<T>;
    } else {
      return (snapshot as firestore.DocumentSnapshot).data() as T;
    }
  }
}
