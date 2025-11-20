import firebase_app from "../../../../firebase/config";
import {
  getFirestore,
  getDocs,
  query,
  collectionGroup,
  where,
} from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";

const db = getFirestore(firebase_app);


export async function POST(request: NextRequest, context: any) {
  const uuid = context.params.uuid;
  const reportCollection: any[] = [];

  await getDocs(
    query(
      collectionGroup(db, "reports"),
      where("reportUid", "==", `${decodeURI(uuid)}`)
    )
  ).then((report) =>
    report.forEach((rep) => {
      if (Object.keys(rep.data()).length !== 0) {
        reportCollection.push(rep.data());
      }
    })
  );

  return NextResponse.json(reportCollection);
}
