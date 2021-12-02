import { db } from './firebase';
import {
    collection,
    query,
    getDocs,
  } from "firebase/firestore";

export const getDocuments = async (collectionName: string, limit: number = 0): Promise<Array<any>> => {
    const ref = query(collection(db, collectionName));
    const snap = await getDocs(ref);

    return snap.docs.map((doc: any): any => {
        return doc.data();
    });
}