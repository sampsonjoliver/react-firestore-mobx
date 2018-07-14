import * as React from 'react';
import { firestore } from 'firebase';
import { inject, observer, IReactComponent } from 'mobx-react';
import { FirestoreObservableFactory } from '../FirestoreObservableFactory';

export const injectFirestore: <T>(
  fsMap: (
    db: firestore.Firestore
  ) => { [K in keyof T]?: firestore.Query | firestore.DocumentReference },
  target: IReactComponent<T>
) => IReactComponent<T> = (
  fsMap: (
    db: firestore.Firestore
  ) => {
    [key: string]: firestore.Query | firestore.DocumentReference | undefined;
  },
  target: IReactComponent
) => {
  const InjectedComponent: IReactComponent = inject('AutoObservableFactory')(
    ({
      autoObservableFactory
    }: {
      autoObservableFactory: FirestoreObservableFactory;
    }) => {
      const db = firestore();
      const fsRefs = fsMap(db);

      const autoObservables = Object.assign(
        {},
        ...Object.entries(fsRefs).map(([key, value]) => ({
          [key]: autoObservableFactory.getOrCreateStore(key, value)
        }))
      );

      const ObserverComponent = observer(target);

      return <ObserverComponent {...autoObservables} />;
    }
  );

  return class extends React.Component<any, any> {
    public render() {
      return <InjectedComponent />;
    }
  } as IReactComponent;
};
