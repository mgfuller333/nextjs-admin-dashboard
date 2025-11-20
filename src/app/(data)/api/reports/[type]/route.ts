import firebase_app from "../../../firebase/config";
import {
  getFirestore,
  getDocs,
  query,
  collectionGroup,
  where,
  orderBy,
} from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";

const db = getFirestore(firebase_app);

export async function POST(request: NextRequest, context: any) {
  const type = context.params.type;
  const req = await request.json();
  const reportCollection: any[] = [];

  if (type === "all") {
    await getDocs(
      query(
        collectionGroup(db, "reports"),
        where("reportDate", "<=", new Date(req.toDate)),
        where("reportDate", ">=", new Date(req.fromDate)),
        orderBy("reportDate", "desc")
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

  await getDocs(
    query(
      collectionGroup(db, "reports"),
      where("type", "==", `${type}`),
      where("reportDate", "<=", new Date(req.toDate)),
      where("reportDate", ">=", new Date(req.fromDate))
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
