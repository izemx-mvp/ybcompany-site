// Starts `vite dev` on a port for the browser checks and waits until it answers.
import { execSync, spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function startDev(port) {
  const child = spawn("npx", ["vite", "dev", "--port", String(port), "--strictPort"], {
    cwd: root,
    shell: true,
    stdio: "ignore",
  });
  for (let i = 0; i < 120; i++) {
    const up = await fetch(`http://localhost:${port}/`).then((r) => r.ok, () => false);
    if (up) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return {
    close: () => {
      if (process.platform === "win32")
        execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "ignore" });
      else child.kill();
    },
  };
}
