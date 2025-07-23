import { NextRequest, NextResponse } from "next/server";
import { PythonShell } from "python-shell";
import path from "path";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const options = {
    mode: "text" as const,
    pythonPath: "python3",
    pythonOptions: ["-u"], // get print results in real-time
    scriptPath: path.join(process.cwd(), "..", "trae_agent"),
    args: ["run", message],
  };

  try {
    const results = await PythonShell.run("cli.py", options);
    const response = results.join("\n");
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error running python script:", error);
    return NextResponse.json(
      { error: "Failed to run agent" },
      { status: 500 }
    );
  }
}
