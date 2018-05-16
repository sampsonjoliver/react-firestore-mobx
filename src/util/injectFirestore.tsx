import * as React from 'react';
import firestore from 'firebase/firestore';
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
  const InjectedComponent: IReactComponent = inject('sovereignFactory')(
    ({ sovereignStore }: { sovereignStore: FirestoreObservableFactory }) => {
      const db = firestore();
      const fsRefs = fsMap(firestore());

      const sovereigns = Object.assign(
        {},
        ...Object.entries(fsRefs).map(([key, value]) => ({
          [key]: sovereignStore.getOrCreateStore(key, value)
        }))
      );

      const ObserverComponent = observer(target);

      return <ObserverComponent {...sovereigns} />;
    }
  );

  return class extends React.Component<any, any> {
    public render() {
      return <InjectedComponent />;
    }
  } as IReactComponent;
};
