import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function checkIsAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  
  console.log('[checkIsAdmin] Current User Context:', {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified
  });
  
  // High-priority bootstrapped admins
  const bootstrappedAdmins = ['sofoniasgenanaw12@gmail.com', 'sofidigital08@gmail.com', 'hospitease@gmail.com'];
  const bootstrappedUids = [
    'LVhHe8CJHLfk84U3BrXnt24DqUA2', 
    'oL5jG3O7sjYQLboGd5oN72HKIAs1',
    'FDOB2R2kqSW9XUSAxWNZ7bpLgtJ3'
  ];
  
  if ((bootstrappedAdmins.includes(user.email || '') && user.emailVerified) || 
      bootstrappedUids.includes(user.uid)) {
    return true;
  }

  try {
    // Check plural collection
    console.log('[checkIsAdmin] Checking plural "admins" collection for:', user.uid);
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (adminDoc.exists()) {
      console.log('[checkIsAdmin] Found in "admins"');
      return true;
    }

    // Fallback: Check singular collection
    console.log('[checkIsAdmin] Checking singular "Admin" collection for:', user.uid);
    const adminDocSingular = await getDoc(doc(db, 'Admin', user.uid));
    if (adminDocSingular.exists()) {
      console.log('[checkIsAdmin] Found in "Admin"');
      return true;
    }

    console.log('[checkIsAdmin] Not found in Firestore collections');
    return false;
  } catch (err) {
    console.warn('[checkIsAdmin] Firestore check error:', err);
    return false;
  }
}
