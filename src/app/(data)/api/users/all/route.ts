import firebase_app from "../../../firebase/config";
import { getFirestore, getDocs, query, collection, DocumentData } from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";

const db = getFirestore(firebase_app);

export async function GET() {
    const userList: DocumentData[] = [];
    const allUsers = await getDocs(query(collection(db, "users")));

    allUsers.forEach((doc) => userList.push(doc.data()));

    return NextResponse.json(userList);
}