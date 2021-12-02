import { db } from './firebase';
import {
    collection,
    query,
    getDocs,
    doc,
    writeBatch
  } from "firebase/firestore";

export const getDocuments = async (collectionName: string, limit: number = 0): Promise<Array<any>> => {
    const ref = query(collection(db, collectionName));
    const snap = await getDocs(ref);

    return snap.docs.map((doc: any): any => {
        return { ...doc.data(), id: doc.id };
    });
}

export const publishChanges = async (collectionName: string, rows: any): Promise<any> => {
    try {
    const batch = writeBatch(db);
    
    rows.forEach((row: any): void => {
        const ref = doc(db, collectionName, row.id);
        batch.set(ref, row);
    });

    return batch.commit();} catch(e) {
        console.log(e);
    }
}