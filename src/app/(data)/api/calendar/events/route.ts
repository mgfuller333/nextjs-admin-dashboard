import firebase_app from "@/app/firebase/config";
import { NextResponse, NextRequest } from "next/server";
import {
  getFirestore,
  getDocs,
  collectionGroup,
  query,
  where,
  collection,
} from "firebase/firestore";

const db = getFirestore(firebase_app);

export async function POST(request: NextRequest, context: any) {
  const events: any[] = [];

  const req = await request.json();

  const q = query(
    collection(db, `orgs/${process.env.INVOKE_ORG_NAME}/Calendar`),
    where("start", ">=", new Date(req.start)),
    where("start", "<=", new Date(req.end))
  );
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    events.push(doc.data());
  });

  return NextResponse.json(events);
}
