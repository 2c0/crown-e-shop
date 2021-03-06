import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const config = {
  apiKey: 'AIzaSyC2LAe_XnlGYIZbVc3AoDfvYP6APwFMxt0',
  authDomain: 'crwn-db-fd0b2.firebaseapp.com',
  databaseURL: 'https://crwn-db-fd0b2.firebaseio.com',
  projectId: 'crwn-db-fd0b2',
  storageBucket: '',
  messagingSenderId: '1099202970860',
  appId: '1:1099202970860:web:94541dcf5bf091c32e91c9',
  measurementId: 'G-2YRXL3TJ69',
};

firebase.initializeApp(config);
export const firestore = firebase.firestore();

/* This function allow us to data from userAuth object into our DB */
export const createUserProfileDocument = async (userAuth, additionalData) => {
  // if our userAuth is null, return aka do nothing
  if (!userAuth) return;

  const userRef = firestore.doc(`users/${userAuth.uid}`);

  const snapShot = await userRef.get();

  // console.log('snapShot', snapShot);

  /*
    the exist is a prop from snapShot object and it
    tells whether data is there or not aka if user is in db
  */
  if (!snapShot.exists) {
    const { displayName, email } = userAuth;
    // time when user was added from Date object
    const createdAt = new Date();

    // adding user to the system with our props
    try {
      await userRef.set({
        displayName,
        email,
        createdAt,
        ...additionalData,
      });
    } catch (error) {
      console.log('error creating user', error.message);
    }
  }

  return userRef;
};

// util to programatically add object to DB
export const addCollectionAndDocuments = async (
  collectionKey,
  objectsToAdd
) => {
  const collectionRef = firestore.collection(collectionKey);

  const batch = firestore.batch();
  objectsToAdd.forEach((obj) => {
    const newDocRef = collectionRef.doc();
    batch.set(newDocRef, obj);
  });
  await batch.commit();
};

export const convertCollectionsSnapshotToMap = (collections) => {
  const tranformedCollection = collections.docs.map((docSnapshot) => {
    const { title, items } = docSnapshot.data();

    return {
      routeName: encodeURI(title.toLowerCase()),
      id: docSnapshot.id,
      title,
      items,
    };
  });

  return tranformedCollection.reduce((accumulator, collection) => {
    accumulator[collection.title.toLowerCase()] = collection;
    return accumulator;
  }, {});
};

export const auth = firebase.auth();

const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
export const signInWithGoogle = () => auth.signInWithPopup(provider);

export default firebase;
