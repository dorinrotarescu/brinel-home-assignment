// Starts the backend, waits until it accepts connections, then starts the frontend.
// Run it from the repository root with `npm start`. Ctrl+C stops both.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';

const BACKEND_PORT = 8080;
const FRONTEND_PORT = 4200;
// The first run downloads Maven and all backend dependencies, so allow plenty of time.
const BACKEND_START_TIMEOUT_MS = 10 * 60 * 1000;

const children = new Set();
let stopping = false;

function log(message) {
  console.log(`\x1b[35m[start]\x1b[0m ${message}`);
}

function canConnect(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

// Check IPv4 and IPv6: the Angular dev server listens on "localhost", which is often only ::1.
async function isPortInUse(port) {
  const results = await Promise.all([canConnect(port, '127.0.0.1'), canConnect(port, '::1')]);
  return results.some(Boolean);
}

async function waitForPort(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (!stopping && Date.now() < deadline) {
    if (await isPortInUse(port)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

function run(name, color, command, cwd) {
  const child = spawn(command, {
    cwd: path.join(root, cwd),
    shell: true,
    // On macOS / Linux, give the child its own process group so stop() can end the whole tree.
    detached: !isWindows,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const prefix = `\x1b[${color}m[${name}]\x1b[0m `;
  for (const stream of [child.stdout, child.stderr]) {
    readline.createInterface({ input: stream }).on('line', (line) => console.log(prefix + line));
  }
  children.add(child);
  child.on('error', (error) => {
    log(`Could not start ${name}: ${error.message}`);
    children.delete(child);
    stop(1);
  });
  child.on('exit', (code) => {
    children.delete(child);
    if (!stopping) {
      log(`${name} exited with code ${code}. Stopping everything.`);
      stop(code || 1);
    } else if (children.size === 0) {
      process.exit(process.exitCode);
    }
  });
}

function kill(child) {
  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      // Already gone.
    }
  }
}

function stop(exitCode = 0) {
  if (stopping) {
    return;
  }
  stopping = true;
  process.exitCode = exitCode;
  if (children.size === 0) {
    process.exit(exitCode);
  }
  for (const child of children) {
    kill(child);
  }
  // Don't wait forever for a process that ignores the signal.
  setTimeout(() => process.exit(exitCode), 15000).unref();
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

for (const port of [BACKEND_PORT, FRONTEND_PORT]) {
  if (await isPortInUse(port)) {
    log(`Port ${port} is already in use. Stop whatever is running there and try again.`);
    process.exit(1);
  }
}

if (!existsSync(path.join(root, 'frontend', 'node_modules'))) {
  log('Installing frontend dependencies (first run only)...');
  const install = spawnSync('npm ci', { cwd: path.join(root, 'frontend'), stdio: 'inherit', shell: true });
  if (install.status !== 0) {
    log('npm ci failed.');
    process.exit(install.status || 1);
  }
}

log('Starting the backend...');
run('backend', 36, `${isWindows ? '.\\mvnw.cmd' : './mvnw'} spring-boot:run`, 'backend');

if (!(await waitForPort(BACKEND_PORT, BACKEND_START_TIMEOUT_MS))) {
  if (!stopping) {
    log(`The backend did not start on port ${BACKEND_PORT} in time.`);
    stop(1);
  }
} else {
  log('Backend is up. Starting the frontend...');
  run('frontend', 33, 'npm start', 'frontend');
  if (await waitForPort(FRONTEND_PORT, 5 * 60 * 1000)) {
    log(`Ready: open http://localhost:${FRONTEND_PORT}`);
  }
}
