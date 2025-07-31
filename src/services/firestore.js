import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getDocuments = async (collectionName, conditions = [], orderField = 'createdAt', limitCount = null) => {
  try {
    let q = collection(db, collectionName);
    
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    
    q = query(q, orderBy(orderField, 'desc'));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message);
  }
};

export const subscribeToCollection = (collectionName, callback, conditions = []) => {
  let q = collection(db, collectionName);
  
  conditions.forEach(condition => {
    q = query(q, where(condition.field, condition.operator, condition.value));
  });
  
  return onSnapshot(q, (querySnapshot) => {
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(docs);
  });
};