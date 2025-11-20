import firebase_app from "../../../../firebase/config";
import { getFirestore, getDoc, doc, deleteDoc } from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";

const db = getFirestore(firebase_app);

export async function DELETE(request: NextRequest, context: any) {
  const managedUser = context.params.user;
  const docRef = doc(db, `users/${managedUser}`);

  try {
    await deleteDoc(docRef);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    throw error;
  }
}
