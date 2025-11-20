import firebase_app from "../../../../../firebase/config";
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
  const workstation = context.params.workstation;
  const type = context.params.type;
  const reportCollection: any[] = [];

  await getDocs(
    query(
      collectionGroup(db, "reports"),
      where("reportLocation", "==", `${decodeURI(workstation)}`),
      where("type", "==", `${decodeURI(type)}`)
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
