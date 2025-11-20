import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET() {
  const response = await list();
  const PP = response.blobs.find(
    (blob) => blob.pathname == "Invoke Innovations Privacy Policy.pdf"
  );

  return NextResponse.json(PP);
}
