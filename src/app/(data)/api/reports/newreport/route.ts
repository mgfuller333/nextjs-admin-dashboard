import firebase_app from "@/app/firebase/config";
import {
  getFirestore,
  addDoc,
  doc,
  collection,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  getDownloadURL,
  listAll,
  uploadBytesResumable,
  getStorage,
} from "firebase/storage";
import { NextRequest, NextResponse } from "next/server";

const db = getFirestore(firebase_app);
const storage = getStorage();

export async function POST(request: Request, context: any) {
  if (request.method !== "POST") {
    return new Response(null, { status: 404, statusText: "Not Found" });
  }

  var formData: any;
  formData = await request.formData();
  const type: String = formData.get("reportType");
  const reportEmployee: String = formData.get("reportEmployee");
  const reportLocation: String = formData.get("reportLocation");
  const reportDescription: String = formData.get("reportDescription");
  const reportDate: Date = new Date(formData.get("reportDate"));
  const reportUid: String = formData.get("reportUid").trim();
  const injuryTypeString: String = formData.get("reportInjuryType");
  const reportBodyParts: String = formData.get("reportBodyParts");
  const reportMeasuresTaken: String = formData.get("reportMeasuresTaken");
  const reportPrevFeedback: String = formData.get("reportType");
  const reportWitnesses: String = formData.get("reportWitnesses");
  const handleUploadFiles = async (reportid: string) => {
    const fileIndexNumber: number | null = formData.get(
      "fileIndex"
    ) as unknown as number;
    var buffer: Buffer;
    const injuryID = formData.get("injuryID");

    if (fileIndexNumber > 0) {
      for (var x: number = 0; x <= fileIndexNumber; x++) {
        const file: File | null = formData.get(`file${x}`) as unknown as File;

        const fileName = await file.name;

        const bytes = await file.arrayBuffer();
        buffer = Buffer.from(bytes);

        try {
          const storageRef = ref(
            storage,
            `WorkCompOutput/${reportid}/${fileName}`
          );
          const uploadTask = uploadBytesResumable(storageRef, buffer);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

              switch (snapshot.state) {
                case "paused":
                  break;
                case "running":
                  break;
              }
            },
            (error) => {
              switch (error.code) {
                case "storage/unauthorized":
                  break;
                case "storage/canceled":
                  break;

                case "storage/unknown":
                  break;
              }
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {});
            }
          );
        } catch (error) {
          return NextResponse.json({ message: "Error" });
        }
      }
    }
  };

  const newReportRef = await addDoc(
    collection(db, `users/${reportUid}/reports`),
    {
      type: type ? type : null,
      reportDate: reportDate ? reportDate : null,
      reportUid: reportUid ? reportUid : null,
      reportDescription: reportDescription ? reportDescription : null,
      reportWitnesses: reportWitnesses ? reportWitnesses : null,
      reportLocation: reportLocation ? reportLocation : null,
      injuryType: injuryTypeString ? injuryTypeString : null,
      reportMeasuresTaken: reportMeasuresTaken ? reportMeasuresTaken : null,
      reportPrevFeedback: reportPrevFeedback ? reportPrevFeedback : null,
      reportBodyParts: reportBodyParts.split(",")
        ? reportBodyParts.split(",")
        : null,
    }
  );

  await handleUploadFiles(newReportRef.id);
  await updateDoc(newReportRef, {
    reportID: newReportRef.id,
  });
  return NextResponse.json({ message: newReportRef.id });
}
