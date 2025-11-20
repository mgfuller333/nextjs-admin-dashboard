import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET() {
  const response = await list();
  const TOS = response.blobs.find(
    (blob) => blob.pathname == "Invoke Innovations Terms of Service.pdf"
  );

  return NextResponse.json(TOS);
}
