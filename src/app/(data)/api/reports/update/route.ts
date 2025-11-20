import firebase_app from "../../../firebase/config";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  collectionGroup,
  where,
  orderBy,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";

const db = getFirestore(firebase_app);

export async function POST(request: NextRequest, context: any) {
  const req = await request.json();

  const reportRef = doc(
    db,
    "users",
    decodeURIComponent(req.uid),
    "reports",
    req.reportID
  );

  await updateDoc(reportRef, { [req.field]: req.value });

  return NextResponse.json({ [req.reportID]: "updated" });
}
