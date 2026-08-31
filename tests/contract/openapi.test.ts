import { openApiSpec } from '../../server/openapi/openapi.spec';

export function runOpenApiContractTests(): { passed: number; failed: number; tests: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${testName}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${testName}`);
    }
  }

  const spec: any = openApiSpec;
  assert(spec.openapi === '3.0.3', 'Contract: OpenAPI specification version is 3.0.3');
  assert(Boolean(spec.paths['/tenders']), 'Contract: /tenders endpoint defined in schema');
  assert(Boolean(spec.paths['/bids/{id}']), 'Contract: /bids/{id} endpoint defined in schema');
  assert(Boolean(spec.paths['/bids/{id}/decision']), 'Contract: /bids/{id}/decision endpoint defined in schema');
  assert(Boolean(spec.paths['/verification/adapters']), 'Contract: /verification/adapters endpoint defined in schema');
  assert(Boolean(spec.info.title), 'Contract: OpenAPI specification title is defined');
  assert(Boolean(spec.servers && spec.servers.length > 0), 'Contract: API server URL configured');

  return { passed, failed, tests: results };
}
