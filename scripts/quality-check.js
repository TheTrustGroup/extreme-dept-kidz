/**
 * AUTOMATED QUALITY CHECKS
 * Run before every deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running Quality Checks...\n');

const checks = [];

// TypeScript
console.log('📘 Checking TypeScript...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  checks.push({ name: 'TypeScript', passed: true });
} catch (error) {
  checks.push({ name: 'TypeScript', passed: false });
}

// ESLint
console.log('\n📋 Running ESLint...');
try {
  execSync('npx eslint . --ext .ts,.tsx --max-warnings 0', { stdio: 'inherit' });
  checks.push({ name: 'ESLint', passed: true });
} catch (error) {
  checks.push({ name: 'ESLint', passed: false });
}

// Check for console.log
console.log('\n🔍 Checking for console.log...');
const hasConsoleLogs = checkForConsoleLogs('./app');
checks.push({ name: 'No console.log', passed: !hasConsoleLogs });

// Check for TODOs
console.log('\n📝 Checking for TODOs...');
const hasTodos = checkForTodos('./app');
checks.push({ name: 'No TODOs', passed: !hasTodos });

// Build test
console.log('\n🏗️  Testing build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  checks.push({ name: 'Build', passed: true });
} catch (error) {
  checks.push({ name: 'Build', passed: false });
}

// Print results
console.log('\n' + '='.repeat(50));
console.log('📊 QUALITY CHECK RESULTS');
console.log('='.repeat(50));
checks.forEach(check => {
  const icon = check.passed ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
});
const allPassed = checks.every(c => c.passed);
console.log('='.repeat(50));
if (allPassed) {
  console.log('✅ ALL CHECKS PASSED - READY TO DEPLOY');
  process.exit(0);
} else {
  console.log('❌ SOME CHECKS FAILED - FIX BEFORE DEPLOYING');
  process.exit(1);
}

function checkForConsoleLogs(dir) {
  try {
    const files = getAllFiles(dir);
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(file, 'utf8');
        // Skip test files and error boundaries
        if (file.includes('test') || file.includes('error') || file.includes('ErrorBoundary')) {
          continue;
        }
        // Check for console.log (but allow console.error in error handlers)
        if (content.includes('console.log') && !content.includes('// ALLOWED')) {
          console.log(`  ⚠️  Found console.log in: ${file}`);
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

function checkForTodos(dir) {
  try {
    const files = getAllFiles(dir);
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(file, 'utf8');
        // Skip markdown files
        if (file.endsWith('.md')) {
          continue;
        }
        if (/TODO|FIXME|XXX|HACK/i.test(content)) {
          console.log(`  ⚠️  Found TODO in: ${file}`);
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}
