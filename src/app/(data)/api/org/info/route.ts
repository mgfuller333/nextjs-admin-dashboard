import firebase_app from "../../../firebase/config";
import { getFirestore, getDoc, doc, DocumentData } from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";

const db = getFirestore(firebase_app);

export async function GET() {
  const orgInfo = await getDoc(doc(db, `orgs/${process.env.INVOKE_ORG_NAME}`));

  return NextResponse.json(orgInfo.data());
}
