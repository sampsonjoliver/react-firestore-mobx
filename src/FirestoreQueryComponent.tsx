import * as React from 'react';
import { firestore } from 'firebase';
import { IReactComponent, Observer, inject } from 'mobx-react';
import { FirestoreObservableFactory } from './FirestoreObservableFactory';
import { FirestoreAutoObservable } from './FirestoreAutoObservable';

export type FirestoreRef = firestore.Query | firestore.DocumentReference;

export type FirestoreInjected<TInput> = {
  [key in keyof TInput]: FirestoreAutoObservable<any>
} & {
  firestore: firestore.Firestore;
  sovereignFactory: FirestoreObservableFactory;
};

export interface FirestoreQueryProps<TInput> {
  selector: (db: firestore.Firestore) => TInput;
  children: (
    result: FirestoreInjected<TInput>
  ) => IReactComponent | React.ReactElement<any>;
  sovereignStore?: FirestoreObservableFactory;
}

export const FirestoreQueryComponent = inject('sovereignFactory')(
  class FirestoreQuery<TProps> extends React.Component<
    FirestoreQueryProps<TProps>
  > {
    firestore: firestore.Firestore;

    constructor(props: FirestoreQueryProps<TProps>, context: any) {
      super(props, context);

      this.firestore = firestore();
    }

    public render() {
      const fsRefs = this.props.selector(this.firestore);

      const sovereigns = Object.assign(
        {},
        ...Object.entries(fsRefs).map(([key, value]) => ({
          [key]: this.props.sovereignStore!.getOrCreateStore(
            key,
            value as FirestoreRef
          )
        }))
      );

      return (
        <Observer>
          {() => (
            <div>
              {this.props.children({
                ...sovereigns,
                firestore,
                sovereignFactory: this.props.sovereignStore
              })}
            </div>
          )}
        </Observer>
      );
    }
  }
);
