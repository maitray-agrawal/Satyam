import { runComplianceCoreUnitTests } from './unit/compliance-core.test';
import { runValidationUnitTests } from './unit/validation.test';
import { runOpenApiContractTests } from './contract/openapi.test';

async function main() {
  console.log('====================================================');
  console.log('  GEV-VERIFY MONOREPO AUTOMATED TEST SUITE');
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

  const totalPassed = compResults.passed + valResults.passed + contractResults.passed;
  const totalFailed = compResults.failed + valResults.failed + contractResults.failed;

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
