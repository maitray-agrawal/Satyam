process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'warn';

import { runComplianceCoreUnitTests } from './unit/compliance-core.test';
import { runValidationUnitTests } from './unit/validation.test';
import { runOpenApiContractTests } from './contract/openapi.test';
import { runAsyncReconciliationTests } from './unit/reconciliation.test';
import { runConsistencyUnitTests } from './unit/consistency.test';
import { runDemoScenariosTests } from './unit/demo-scenarios.test';
import { runVerificationAdaptersUnitTests } from './unit/verification-adapters.test';
import { runPolicyEdgeCasesTests } from './unit/policy-edge-cases.test';

async function main() {
  console.log('====================================================');
  console.log('  SATYAM MONOREPO AUTOMATED TEST SUITE (SIH 2026 PS 26100)');
  console.log('====================================================\n');

  console.log('--- 1. Compliance Core & Policy Engine Tests ---');
  const compResults = runComplianceCoreUnitTests();
  compResults.tests.forEach((t) => console.log(`  ${t}`));

  console.log('\n--- 2. Zod Domain Validation Tests ---');
  const valResults = runValidationUnitTests();
  valResults.tests.forEach((t) => console.log(`  ${t}`));

  console.log('\n--- 3. OpenAPI 3.0 Contract Tests ---');
  const contractResults = runOpenApiContractTests();
  contractResults.tests.forEach((t) => console.log(`  ${t}`));

  console.log('\n--- 4. Three-Way Reconciliation Engine Tests ---');
  const reconResults = await runAsyncReconciliationTests();
  reconResults.tests.forEach((t) => console.log(`  ${t}`));

  console.log('\n--- 5. Cross-Document Consistency Engine Tests ---');
  const consistencyResults = runConsistencyUnitTests();
  consistencyResults.tests.forEach((t) => console.log(`  ${t}`));

  console.log('\n--- 6. Statutory Verification Adapters Tests ---');
  const adapterResults = await runVerificationAdaptersUnitTests();
  adapterResults.tests.forEach((t) => console.log(`  ${t}`));

  console.log('\n--- 7. End-to-End Demo Scenarios Verification Tests ---');
  const demoResults = await runDemoScenariosTests();
  demoResults.tests.forEach((t) => console.log(`  ${t}`));

  console.log('\n--- 8. Policy-As-Code Edge Cases & Cryptographic Audit Verification ---');
  const edgeResults = await runPolicyEdgeCasesTests();
  edgeResults.tests.forEach((t) => console.log(`  ${t}`));

  const totalPassed =
    compResults.passed +
    valResults.passed +
    contractResults.passed +
    reconResults.passed +
    consistencyResults.passed +
    adapterResults.passed +
    demoResults.passed +
    edgeResults.passed;

  const totalFailed =
    compResults.failed +
    valResults.failed +
    contractResults.failed +
    reconResults.failed +
    consistencyResults.failed +
    adapterResults.failed +
    demoResults.failed +
    edgeResults.failed;

  console.log('\n====================================================');
  console.log(`  TOTAL: ${totalPassed + totalFailed} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);
  console.log('====================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

