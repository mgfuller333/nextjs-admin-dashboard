import firebase_app from "@/app/firebase/config";
import { NextResponse, NextRequest } from "next/server";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import dayjs from "dayjs";

const db = getFirestore(firebase_app);

export async function POST(request: NextRequest, context: any) {
  const req = await request.json();
  const reportDoc = await addDoc(
    collection(db, `orgs/${process.env.INVOKE_ORG_NAME}/Calendar`),
    {
      title: req.title,
      start: dayjs(req.start).toDate(),
      end: dayjs(req.end).toDate(),
    }
  );
  return NextResponse.json({ status: reportDoc.id });
}
