"use client";

import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const fetchAccounts = async () => {
  const accountsCollection = collection(db, 'netflix-accounts');
  const accountsQuery = query(accountsCollection, orderBy('renewalDate'));
  const querySnapshot = await getDocs(accountsQuery);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addNewAccount = async (accountData) => {
  const accountsCollection = collection(db, 'netflix-accounts');
  const docRef = await addDoc(accountsCollection, {
    ...accountData,
    status: 'active',
    lastRenewalDate: accountData.renewalDate,
    createdAt: new Date().toISOString()
  });
  
  return {
    id: docRef.id,
    ...accountData,
    status: 'active',
    lastRenewalDate: accountData.renewalDate
  };
};

export const updateAccount = async (id, accountData) => {
  const accountRef = doc(db, 'netflix-accounts', id);
  await updateDoc(accountRef, accountData);
  return { id, ...accountData };
};

export const deleteAccount = async (id) => {
  await deleteDoc(doc(db, 'netflix-accounts', id));
  return id;
};

export const renewAccount = async (account) => {
  const currentRenewalDate = new Date(account.renewalDate);
  const nextRenewalDate = new Date(currentRenewalDate);
  nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
  
  const updatedData = {
    lastRenewalDate: account.renewalDate,
    renewalDate: nextRenewalDate.toISOString().split('T')[0]
  };

  const accountRef = doc(db, 'netflix-accounts', id);
  await updateDoc(accountRef, updatedData);
  
  return {
    ...account,
    ...updatedData
  };
};