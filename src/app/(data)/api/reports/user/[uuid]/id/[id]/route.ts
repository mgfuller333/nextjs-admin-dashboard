import firebase_app from "../../../../../../firebase/config";
import {
  getFirestore,
  getDocs,
  query,
  collectionGroup,
  where,
} from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";

const db = getFirestore(firebase_app);

export async function GET(request: NextRequest, context: any) {
  const uid = context.params.uuid;
  const reportID = context.params.id;
  const reportCollection: any[] = [];

  await getDocs(
    query(
      collectionGroup(db, "reports"),
      where("reportUid", "==", uid),
      where("reportID", "==", reportID)
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
