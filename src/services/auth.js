import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    return { user: userCredential.user, userData: userDoc.data() };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const registerUser = async (userData) => {
  try {
    const { email, password, ...profileData } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(userCredential.user, {
      displayName: profileData.fullName
    });

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...profileData,
      email,
      role: 'customer',
      isBlocked: false,
      createdAt: new Date()
    });

    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(error.message);
  }
};