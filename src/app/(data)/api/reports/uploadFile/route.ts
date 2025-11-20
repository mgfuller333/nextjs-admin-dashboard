import firebase_app from "../../../firebase/config";
import {
  getFirestore,
  getDocs,
  query,
  collectionGroup,
  where,
} from "firebase/firestore";

import {
  ref,
  getDownloadURL,
  listAll,
  uploadBytesResumable,
  getStorage,
} from "firebase/storage";

import { NextResponse, NextRequest } from "next/server";
// export const config = { runtime: "experimental-edge" };

const db = getFirestore(firebase_app);
const storage = getStorage();

export async function PUT(
  request: NextRequest,
  response: NextResponse,
  context: any
) {
  if (request.method !== "PUT") {
    return new Response(null, { status: 404, statusText: "Not Found" });
  }

  var formData: any;
  // Get formData from request

  formData = await request.formData();

  // Get file from formData

  const fileIndexNumber: number | null = formData.get(
    "fileIndex"
  ) as unknown as number;
  var buffer: Buffer;
  const injuryID = formData.get("injuryID");
  if (fileIndexNumber !== undefined) {
    for (var x: number = 0; x < fileIndexNumber + 1; x++) {
      const file: File | null = (await formData.get(
        `file${x}`
      )) as unknown as File;
      const fileName = file.name;

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);

      // return NextResponse.json({ success: false });

      try {
        // Create the file metadata
        /** @type {any} */
        const metadata = {
          contentType: "file/pdf",
        };
        // Upload file and metadata to the object 'images/mountains.jpg'

        const storageRef = ref(
          storage,
          `WorkCompOutput/${injuryID}/${fileName}`
        );
        const uploadTask = uploadBytesResumable(storageRef, buffer);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
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
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
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
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {});
          }
        );
      } catch (error) {
        return NextResponse.json({ message: "Error" });
      }
    }
  }
  return NextResponse.json({
    message: "Files Uploaded!",
  });
}
