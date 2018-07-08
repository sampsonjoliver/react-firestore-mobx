# react-firestore-mobx-bindings

[![Typescript Version](https://img.shields.io/badge/Typescript-2.8-2f69f4.svg?style=flat)](https://www.typescriptlang.org/)
[![MobX Version](https://img.shields.io/badge/MobX-4.2-2f69f4.svg?style=flat)](https://github.com/mobxjs/mobx)
[![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://prettier.io/)
[![Version](https://img.shields.io/badge/Version-0.0.1-ff6964.svg?style=flat)](https://github.com/sampsonjoliver/react-firestore-mobx)

A lightweight library to bind firestore data into react components statefully via mobx.

---

Uses MobX 4.x's `onBecomeObserved`/`onBecomeUnobserved` and mobx-react's `inject`/`observer` methods to provide a simple, scalable, and efficient mechanism for binding firestore data into react components. Components will automatically attach and detach realtime data listeners as they are mounted and unmounted from the react dom.

## Why?

Because the less you have to manage your data, while still having full control over it, the better.

Firestore is a great service to allow _all_ of your app data to exist non-locally while still appearing performant and seamless. The motivation of this library is to reduce the barrier to binding that app data into your react components, while still providing the power and control of using mobx in the data layer.

## Setup

Install with

```
yarn add react-firestore-mobx-bindings
```

Then, provide the firestore factory to the React Context using `MobxProvider` from `mobx-react`:

```
import { Provider as MobxProvider } from 'mobx-react';
import { FirestoreObservableFactory } from 'react-firestore-mobx-bindings';

const factory = new FirestoreObservableFactory('my factory');

export const Root: React.StatelessComponent<> = () => {
  return (
    <MobxProvider AutoObservableFactory={factoryy}>
        ...
    </MobxProvider>
  );
};
```

> **NOTE**: You _must_ provide the factory to the MobxProvider as `AutoObservableFactory` in order for it to be located by the HOX and query component.

## Usage

`react-firestore-mobx-bindings` provides a HOC method, or a query component, depending on your preference.

### Using `injectFirestore` as a HOC:

```
const injectedByHoc = injectFirestore(
  firestore => ({
    users: firestore.collection('users'),
  }),
  ({ users }) => {
    if (users.isLoading) {
      return <Spinner/>
    } else if (users.data) {
      return <li> {users.data.map(user => <li>user.name</li>} </li>
    } else {
      return <p>No data</p>
    }
  }
);
```

### Using `FirestoreQueryComponent` query component:

```
const queryComponent = () => {
  const selector = (firestore) => ({
    users: firestore.collection('users')
  });

  return <FirestoreQueryComponent selector={selector}>
    {({users}) => {
      if (users.isLoading) {
        return <Spinner/>
      } else if (users.data) {
        return <li> {users.data.map(user => <li>user.name</li>} </li>
      } else {
        return <p>No data</p>
      }
    }
  </FirestoreQueryComponent>
}
```

### Queries and Documents

Both the HOC and Query component accept firestore queries and document references in their selectors

```
const queryComponent = (userId) => {
  const selector = (firestore) => ({
    user: firestore.collection('users').doc(userId),
    photos: firestore.collection('photos').where('userId', '==', userId)
  });

  return <FirestoreQueryComponent selector={selector}>
    {({user, photos}) => {
      ...
    }
  </FirestoreQueryComponent>
}
```

### Key Uniqueness Constraint

The library uses the keys of the provided selector to re-use firestore references, hence you need to pay some attention to the names of your keys.

Hence, the following would provide a conflict, as both components use the same `user` key in their selector:

```
const queryComponent = (userId) => {
  const selector = (firestore) => ({
    user: firestore.collection('users').doc(userId)
  });

  return <FirestoreQueryComponent selector={selector}>
    {({user}) => {
      ...
    }
  </FirestoreQueryComponent>
}

...

const otherQueryComponent = (photoId, userId) => {
  const selector = (firestore) => ({
    user: firestore.collection('photos').doc(photoId).collection('taggedUsers').doc(userId)
  });

  return <FirestoreQueryComponent selector={selector}>
    {({user}) => {
      ...
    }
  </FirestoreQueryComponent>
}
```
