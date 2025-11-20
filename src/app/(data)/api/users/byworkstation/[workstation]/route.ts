import firebase_app from "../../../../firebase/config";
import {
  getFirestore,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";

const db = getFirestore(firebase_app);

export async function GET(request: NextRequest, context: any) {
  const workstation = context.params.workstation;
  const userCollection: any[] = [];

  await getDocs(
    query(
      collection(db, "users"),
      where("Workstations", "array-contains", decodeURI(workstation))
    )
  ).then((report) =>
    report.forEach((rep) => {
      if (Object.keys(rep.data()).length !== 0) {
        userCollection.push(rep.data());
      }
    })
  );

  return NextResponse.json(userCollection);
}
