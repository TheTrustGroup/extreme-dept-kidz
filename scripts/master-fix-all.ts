/**
 * Master Fix All
 *
 * Runs in order: check-env → test-db → fix-admin.
 * Run with: npm run fix-all
 */

import { execSync } from 'child_process';

const steps: Array<{ name: string; script: string }> = [
  { name: 'Check environment', script: 'check-env' },
  { name: 'Test database', script: 'test-db' },
  { name: 'Fix admin user', script: 'fix-admin' },
];

function run(name: string, script: string) {
  console.log('\n' + '═'.repeat(50));
  console.log(`▶ ${name} (npm run ${script})`);
  console.log('═'.repeat(50));
  execSync(`npm run ${script}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
}

function main() {
  console.log('🔧 Master Fix All');
  for (const { name, script } of steps) {
    run(name, script);
  }
  console.log('\n🎉 All steps completed.');
}

main();
