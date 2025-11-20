import firebase_app from "../../../firebase/config";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";

const db = getFirestore(firebase_app);

export async function GET(request: NextRequest, context: any) {
  const id = context.params.id;
  const docRef = doc(db, `users/${id}`);

  const userData = await getDoc(docRef);
  return NextResponse.json(userData.data());
}
