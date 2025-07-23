import { useEffect, useRef } from "react";
import { Terminal as Xterm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Xterm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new Xterm({
        cursorBlink: true,
        convertEol: true,
        fontFamily: "monospace",
      });
      const fitAddon = new FitAddon();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();

      const socket = new WebSocket("ws://localhost:3000/api/terminal");
      socketRef.current = socket;

      socket.onopen = () => {
        term.writeln("Connected to terminal");
      };

      socket.onmessage = (event) => {
        term.write(event.data);
      };

      term.onData((data) => {
        socket.send(data);
      });
    }
  }, []);

  return (
    <div
      ref={terminalRef}
      className="bg-black rounded-lg shadow-md p-2 h-full"
    ></div>
  );
}
