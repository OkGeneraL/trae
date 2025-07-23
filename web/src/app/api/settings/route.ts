import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const configPath = path.join(process.cwd(), "..", "trae_config.json");

export async function GET() {
  try {
    const config = await fs.readFile(configPath, "utf-8");
    return NextResponse.json(JSON.parse(config));
  } catch (error) {
    return NextResponse.json({ error: "Failed to read config" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newConfig = await req.json();
    await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));
    return NextResponse.json({ message: "Config saved successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
