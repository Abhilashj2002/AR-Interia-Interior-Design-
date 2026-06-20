#!/usr/bin/env node

const { exec } = require('child_process');
const ports = process.argv.slice(2);

if (ports.length === 0) {
  console.log('No ports specified to kill');
  process.exit(0);
}

ports.forEach(port => {
  const command = process.platform === 'win32' 
    ? `netstat -ano | findstr :${port}`
    : `lsof -ti:${port}`;

  exec(command, (error, stdout, stderr) => {
    if (!stdout) return;

    const pids = process.platform === 'win32'
      ? stdout.split('\n')
          .filter(line => line.includes('LISTENING'))
          .map(line => line.trim().split(/\s+/).pop())
          .filter(pid => pid)
      : stdout.trim().split('\n');

    pids.forEach(pid => {
      const killCommand = process.platform === 'win32'
        ? `taskkill /F /PID ${pid}`
        : `kill -9 ${pid}`;

      exec(killCommand, (killError) => {
        if (!killError) {
          console.log(`Killed process ${pid} on port ${port}`);
        }
      });
    });
  });
});

setTimeout(() => process.exit(0), 2000);
