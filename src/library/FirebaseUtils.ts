import {
  addDoc,
  collection, deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query, setDoc,
  Timestamp,
  where,
  initializeFirestore
} from "firebase/firestore";
import {initializeApp} from "firebase/app";
import {DocumentReference} from "@firebase/firestore-types";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User
} from "firebase/auth";
import { UserSettings } from "../routes/UserSettingsEdit";

// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyCdarpfE9BN07iyiDjcufHd3MKyETzDUnw",
  authDomain: "vinobarrel-58576.firebaseapp.com",
  projectId: "vinobarrel-58576",
  storageBucket: "vinobarrel-58576.appspot.com",
  messagingSenderId: "374710471223",
  appId: "1:374710471223:web:d34cb30be1d63c35264db2",
  measurementId: "G-LJTGLW7H8W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
})

export const auth = getAuth(app);

export const getUser = (): Promise<User> => {
  return new Promise<User>((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser)
    } else {
      const unsubscribe = onAuthStateChanged(auth, (_user) => {
        if (_user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          unsubscribe()
          resolve(_user)
        } else {
          unsubscribe()
          reject('unauthorized')
        }
      });
    }
  })
}

const createUserDoc = async (user: User) => {
  await setDoc(doc(db, 'users', user.uid), {email: user.email});
}

export const createUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed in
      await createUserDoc(userCredential.user);
      return {ok: true, message: ''}
    })
    .catch((error) => {
      // const errorCode = error.code;
      const errorMessage = error.message;
      return {ok: false, message: errorMessage}
    });
}

export const sendPasswordReset = (email: string) => {
  return sendPasswordResetEmail(auth, email)
    .then(() => {
      return {ok: true, message: 'Password Reset Email Sent'}
    })
    .catch((error) => {
      const errorMessage = error.message;
      return {ok: false, message: errorMessage}
    });
}

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      // Signed in
      return {ok: true, message: ''}
    })
    .catch((error) => {
      const errorMessage = error.message;
      return {ok: false, message: errorMessage}
    });
}

export const signUserOut = () => signOut(auth)

//types in Firestore
type Keg = {
  id: string;
  beverageRef?: DocumentReference;
  ounces: number;
  smallPrice: number;
  smallOunces: number;
  fullPrice: number;
  fullOunces: number;
}

type Barrel = {
  id: string;
  name: string;
  temperature: {
    fahrenheit: number,
    timestamp: Timestamp
  };
  kegs: KegUI[];
}

type Beverage = {
  id: string;
  name: string;
  info: string;
  image: string;
  tastingNotes: string;
}

//types specific to UI
export type KegUI = Keg & {
  beverage?: Beverage;
  beveragePath?: string;
}

export type BarrelUI = Omit<Barrel, 'kegs'> & {
  kegs: KegUI[]
}

export type BeverageUI = Beverage & {
  ref?: DocumentReference
}

export const getTransactionsQuery = async (timeframeHour: number) => {
  const user = await getUser()
  const timestamp = Timestamp.now().toMillis() - (timeframeHour * 3600000)
  return query(collection(db, 'users', user.uid, 'transactions'), where("timestamp", ">=", Timestamp.fromMillis(timestamp)), orderBy("timestamp", "desc"));
}

const getKegInformation = async (kegs: Keg[]) => {
  const updatedKegs = []
  for (const keg of kegs) {
    // @ts-ignore
    const beverage = keg?.beverageRef ? await getDoc(keg.beverageRef) : undefined
    if (beverage) {
      updatedKegs.push({
        ...keg,
        beveragePath: keg.beverageRef?.path,
        beverage: {...beverage.data() as Beverage, id: beverage.id, ref: keg.beverageRef}
      })
    } else {
      updatedKegs.push({...keg})
    }
  }
  return updatedKegs
}

export const getBarrels = async (): Promise<Barrel[]> => {
  const user = await getUser()
  const q = query(collection(db, 'users', user.uid, "barrels"));
  const querySnapshot = await getDocs(q);
  const barrels: Barrel[] = []

  querySnapshot.forEach((barrelDoc) => {
    barrels.push({...barrelDoc.data() as Barrel, id: barrelDoc.id})
  })
  for (const barrel of barrels) {
    barrel.kegs = await getKegInformation(barrel.kegs)
  }
  return barrels
}

export const getBarrel = async (barrelId: string): Promise<BarrelUI | undefined> => {
  const user = await getUser()
  const docRef = doc(db, 'users', user.uid, "barrels", barrelId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const barrel = docSnap.data() as Barrel
    const kegs = await getKegInformation(barrel.kegs)
    return {...barrel, id: docSnap.id, kegs: kegs}
  } else {
    console.log("No such document!");
  }
}

export const createBarrel = async () => {
  const user = await getUser()
  const barrel = {
    name: '',
    temperature: {
      fahrenheit: 0.0,
      timestamp: Timestamp.now()
    },
    kegs: [
      {
        id: 'red',
        ounces: 25,
        smallPrice: 3.00,
        smallOunces: 1.5,
        fullPrice: 9.00,
        fullOunces: 9.00,
      },
      {
        id: 'green',
        ounces: 25,
        smallPrice: 3.00,
        smallOunces: 1.5,
        fullPrice: 9.00,
        fullOunces: 9.00,
      }
    ]
  }
  const ref = await addDoc(collection(db, 'users', user.uid, "barrels"), barrel);
  return ref.id
}

export const saveBarrel = async (barrel: Barrel) => {
  const user = await getUser()
  for (const keg of barrel.kegs) {
    if (keg.beveragePath) {
      // @ts-ignore
      keg.beverageRef = doc(db, keg?.beveragePath)
    }
  }
  await setDoc(doc(db, 'users', user.uid, "barrels", barrel.id), barrel, {merge: true});
}

export const deleteBarrel = async (barrelId: string) => {
  const user = await getUser()
  await deleteDoc(doc(db, 'users', user.uid, "barrels", barrelId));
}

export const getBeverages = async (): Promise<BeverageUI[]> => {
  const q = query(collection(db, "beverages"));
  const querySnapshot = await getDocs(q);
  const beverages: BeverageUI[] = []
  querySnapshot.forEach((doc) => {
    beverages.push({...doc.data() as Beverage, id: doc.id, ref: doc.ref as unknown as DocumentReference})
  });
  return beverages
}

export const getBeverage = async (beverageId: string): Promise<Beverage | undefined> => {
  const docRef = doc(db, "beverages", beverageId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const b = {...docSnap.data(), id: docSnap.id}
    return b as Beverage
  } else {
    console.log("No such document!");
  }
}

export const deleteBeverage = async (beverageId: string) => {
  await deleteDoc(doc(db, "beverages", beverageId));
}

export const saveBeverage = async (beverage: Partial<Beverage>): Promise<string> => {
  if (beverage?.id) {
    await setDoc(doc(db, "beverages", beverage.id), beverage, {merge: true});
    return beverage?.id
  } else {
    const ref = await addDoc(collection(db, "beverages"), beverage);
    return ref.id
  }
}

export const getUserSettings =async () => {
  const user = await getUser()
  const docRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const user = docSnap.data() as UserSettings
    return {...user}
  } else {
    console.log("No such document!");
  }
}

export const saveUserSettings = async (userSettings: UserSettings) => {
  const user = await getUser()
  await setDoc(doc(db, 'users', user.uid), userSettings, {merge: true});
}