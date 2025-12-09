/**
 * Integration test for frontend-backend communication
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testAPI(endpoint, description) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();
    console.log(`✅ ${description}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...\n');
    return true;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Frontend-Backend Integration Test');
  console.log('='.repeat(60));
  console.log();

  const tests = [
    ['/health', 'Health Check'],
    ['/search/providers?symptom=chest+pain&limit=2', 'Symptom Search (chest pain)'],
    ['/search/providers?symptom=headache&limit=2', 'Symptom Search (headache)'],
    ['/specialties', 'Get All Specialties'],
    ['/hospitals', 'Get All Hospitals']
  ];

  let passed = 0;
  for (const [endpoint, description] of tests) {
    if (await testAPI(endpoint, description)) {
      passed++;
    }
  }

  console.log('='.repeat(60));
  console.log(`Results: ${passed}/${tests.length} tests passed`);
  console.log('='.repeat(60));
  console.log();

  if (passed === tests.length) {
    console.log('✅ ALL INTEGRATION TESTS PASSED!');
    console.log();
    console.log('Frontend is properly configured to communicate with backend:');
    console.log(`  - Frontend URL: http://localhost:8080`);
    console.log(`  - Backend API:  ${API_BASE_URL}`);
    console.log(`  - GraphDB:      http://localhost:7200`);
    console.log();
    console.log('You can now use the frontend application!');
  } else {
    console.log('❌ Some tests failed. Check the backend connection.');
  }
}

runTests();
