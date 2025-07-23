import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json(
      { error: "File path is required" },
      { status: 400 }
    );
  }

  // Mock file content
  const content = `// Content of ${filePath}`;
  return NextResponse.json({ content });
}

export async function POST(req: NextRequest) {
  const { filePath, content } = await req.json();

  if (!filePath || !content) {
    return NextResponse.json(
      { error: "File path and content are required" },
      { status: 400 }
    );
  }

  // Mock file saving
  console.log(`Saving file: ${filePath}`);
  console.log(`Content: ${content}`);

  return NextResponse.json({ message: "File saved successfully" });
}
