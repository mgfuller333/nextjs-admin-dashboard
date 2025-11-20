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
  const req = await request.json();
  const reportCollection: any[] = [];

  await getDocs(
    query(
      collectionGroup(db, "reports"),
      where("reportDate", "<=", new Date(req.endDateFilterValue)),
      where("reportDate", ">=", new Date(req.startDateFilterValue))
      //   where("type", "in", req.incidentFilterValue)
      //   where("reportBodyParts", "in", req.bodyPartFilterValue)
      //   where("reportLocation", "in", req.locationFilterValue)
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
