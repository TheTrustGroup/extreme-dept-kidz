/**
 * Feature Testing Script
 * 
 * Run comprehensive tests on all features
 */

interface TestResult {
  feature: string;
  status: 'pass' | 'fail' | 'skip';
  message?: string;
}

const tests: TestResult[] = [];

async function testFeature(name: string, testFn: () => Promise<boolean>): Promise<void> {
  try {
    const result = await testFn();
    tests.push({
      feature: name,
      status: result ? 'pass' : 'fail',
    });
  } catch (error) {
    tests.push({
      feature: name,
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function runTests(): Promise<void> {
  console.log('🧪 Running comprehensive feature tests...\n');

  // Test Search API
  await testFeature('Search API', async () => {
    const response = await fetch('http://localhost:3000/api/search?q=shirt');
    const data = await response.json();
    return response.ok && Array.isArray(data.results);
  });

  // Test Category API
  await testFeature('Category API', async () => {
    const response = await fetch('http://localhost:3000/api/admin/categories');
    return response.ok;
  });

  // Test Upload API (requires auth)
  await testFeature('Upload API Authentication', async () => {
    const response = await fetch('http://localhost:3000/api/admin/upload', {
      method: 'POST',
    });
    // Should return 401 without auth
    return response.status === 401;
  });

  // Test Order Tracking API
  await testFeature('Order Tracking API', async () => {
    const response = await fetch(
      'http://localhost:3000/api/orders/track?number=ORD-12345&email=test@example.com'
    );
    return response.ok || response.status === 404; // 404 is expected for invalid orders
  });

  // Print results
  console.log('\n📊 Test Results:');
  console.log('='.repeat(50));
  
  const passed = tests.filter((t) => t.status === 'pass').length;
  const failed = tests.filter((t) => t.status === 'fail').length;
  
  tests.forEach((test) => {
    const icon = test.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${test.feature}: ${test.status.toUpperCase()}`);
    if (test.message) {
      console.log(`   ${test.message}`);
    }
  });
  
  console.log('='.repeat(50));
  console.log(`\nTotal: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests, testFeature };
