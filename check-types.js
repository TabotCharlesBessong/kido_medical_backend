const { spawnSync } = require('child_process');

const result = spawnSync('npx', ['tsc', '--noEmit', 'src/services/email.service.ts'], { encoding: 'utf8' });

console.log('Exit code:', result.status);
console.log('stdout:', result.stdout);
console.log('stderr:', result.stderr);

if (result.status === 0) {
  console.log('TypeScript compilation successful!');
} else {
  console.log('TypeScript compilation failed!');
}