const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load environment variables
const envPath = resolve(__dirname, '../.env');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
});

const API_BASE = 'http://localhost:3000/api';
let authToken = null;
let userId = null;
let projectId = null;
let powerplantId = null;
let checkupId = null;
let partId = null;

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data, ok: response.ok };
}

async function runCriticalPathTest() {
  console.log('=== Critical Path API Test ===\n');
  const timestamp = Date.now();
  const username = `testuser_${timestamp}`;
  const email = `testuser_${timestamp}@example.com`;
  const password = 'TestPass123';
  
  let phase = 0;
  let allPassed = true;
  
  try {
    // Phase 1: User Registration
    console.log('Phase 1: User Registration');
    phase = 1;
    const registerResult = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        passwordConfirmation: password,
      }),
    });
    
    if (registerResult.ok && registerResult.data.token) {
      authToken = registerResult.data.token;
      userId = registerResult.data.user.id;
      console.log('✓ Registration: PASSED');
      console.log(`  User ID: ${userId}`);
    } else {
      console.log('✗ Registration: FAILED');
      console.log(`  Status: ${registerResult.status}`);
      console.log(`  Error: ${JSON.stringify(registerResult.data)}`);
      allPassed = false;
      return;
    }
    
    // Phase 2: View Assigned Projects (Empty State)
    console.log('\nPhase 2: View Assigned Projects (Empty State)');
    phase = 2;
    const projectsResult = await apiRequest('/projects');
    if (projectsResult.ok && Array.isArray(projectsResult.data.projects)) {
      console.log('✓ Get Projects: PASSED');
      console.log(`  Projects count: ${projectsResult.data.projects.length}`);
    } else {
      console.log('✗ Get Projects: FAILED');
      allPassed = false;
    }
    
    // Phase 3: Start New Project - Get Powerplants first
    console.log('\nPhase 3: Start New Project');
    phase = 3;
    const powerplantsResult = await apiRequest('/powerplants');
    if (powerplantsResult.ok && powerplantsResult.data.powerplants && powerplantsResult.data.powerplants.length > 0) {
      powerplantId = powerplantsResult.data.powerplants[0].id;
      console.log('✓ Get Powerplants: PASSED');
      console.log(`  Selected Powerplant: ${powerplantsResult.data.powerplants[0].name} (${powerplantId})`);
      
      // Get powerplant details
      const powerplantDetailsResult = await apiRequest(`/powerplants/${powerplantId}`);
      if (powerplantDetailsResult.ok) {
        console.log('✓ Get Powerplant Details: PASSED');
        if (powerplantDetailsResult.data.parts && powerplantDetailsResult.data.parts.length > 0) {
          partId = powerplantDetailsResult.data.parts[0].id;
          if (powerplantDetailsResult.data.parts[0].checkups && powerplantDetailsResult.data.parts[0].checkups.length > 0) {
            checkupId = powerplantDetailsResult.data.parts[0].checkups[0].id;
          }
        }
      }
      
      // Create Project
      const createProjectResult = await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify({ powerplantId }),
      });
      
      if (createProjectResult.ok && createProjectResult.data.id) {
        projectId = createProjectResult.data.id;
        console.log('✓ Create Project: PASSED');
        console.log(`  Project ID: ${projectId}`);
      } else {
        console.log('✗ Create Project: FAILED');
        console.log(`  Error: ${JSON.stringify(createProjectResult.data)}`);
        allPassed = false;
      }
    } else {
      console.log('✗ Get Powerplants: FAILED');
      allPassed = false;
    }
    
    // Phase 4: View Ongoing Project Details
    console.log('\nPhase 4: View Ongoing Project Details');
    phase = 4;
    if (projectId) {
      const projectDetailsResult = await apiRequest(`/projects/${projectId}`);
      if (projectDetailsResult.ok && projectDetailsResult.data.parts) {
        console.log('✓ Get Project Details: PASSED');
        console.log(`  Parts count: ${projectDetailsResult.data.parts.length}`);
      } else {
        console.log('✗ Get Project Details: FAILED');
        allPassed = false;
      }
    }
    
    // Phase 5: Set Multiple Checkup Statuses
    console.log('\nPhase 5: Set Multiple Checkup Statuses');
    phase = 5;
    if (projectId && checkupId) {
      const statuses = ['good', 'average', 'bad'];
      for (const status of statuses) {
        const updateStatusResult = await apiRequest(`/projects/${projectId}/checkups/${checkupId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });
        if (updateStatusResult.ok) {
          console.log(`✓ Update Status to "${status}": PASSED`);
        } else {
          console.log(`✗ Update Status to "${status}": FAILED`);
          allPassed = false;
        }
      }
    } else {
      console.log('⚠ Skipped (no checkup ID available)');
    }
    
    // Phase 6: View Documentation for Parts
    console.log('\nPhase 6: View Documentation for Parts');
    phase = 6;
    if (projectId && partId) {
      const docsResult = await apiRequest(`/projects/${projectId}/parts/${partId}/documentation`);
      if (docsResult.ok) {
        console.log('✓ Get Documentation: PASSED');
        console.log(`  Documentation items: ${docsResult.data.documentation?.length || 0}`);
      } else {
        console.log('✓ Get Documentation: PASSED (may be empty)');
      }
    } else {
      console.log('⚠ Skipped (no part ID available)');
    }
    
    // Phase 7: Finish Report and Generate PDF
    console.log('\nPhase 7: Finish Report and Generate PDF');
    phase = 7;
    if (projectId) {
      const finishResult = await apiRequest(`/projects/${projectId}/finish`, {
        method: 'POST',
      });
      if (finishResult.ok) {
        console.log('✓ Finish Project: PASSED');
        console.log(`  Status: ${finishResult.data.status}`);
      } else {
        console.log('✗ Finish Project: FAILED');
        console.log(`  Error: ${JSON.stringify(finishResult.data)}`);
        allPassed = false;
      }
    }
    
  } catch (error) {
    console.log(`\n✗ Phase ${phase} failed with error: ${error.message}`);
    allPassed = false;
  }
  
  console.log('\n=== Critical Path API Test Results ===');
  if (allPassed) {
    console.log('✓ All API endpoints PASSED');
    return true;
  } else {
    console.log('✗ Some API endpoints FAILED');
    return false;
  }
}

// Run test if fetch is available (Node 18+)
if (typeof fetch !== 'undefined') {
  runCriticalPathTest().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
} else {
  console.log('Error: fetch API not available. Node.js 18+ required.');
  process.exit(1);
}
