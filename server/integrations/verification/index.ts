import { VerificationAdapterRegistry, VerificationAdapter } from './verification.adapter';
import { GstVerificationAdapter } from './gst/gst.adapter';
import { PanVerificationAdapter } from './pan/pan.adapter';
import { UdyamVerificationAdapter } from './udyam/udyam.adapter';
import { EpfoVerificationAdapter, EsicVerificationAdapter } from './epfo/epfo-esic.adapter';
import {
  IncomeTaxVerificationAdapter,
  StartupIndiaVerificationAdapter,
  NsicVerificationAdapter,
  OemVerificationAdapter,
  BlacklistVerificationAdapter,
} from './adapters.bundle';

export * from './verification.adapter';
export * from './gst/gst.adapter';
export * from './pan/pan.adapter';
export * from './udyam/udyam.adapter';
export * from './epfo/epfo-esic.adapter';
export * from './adapters.bundle';

export function initializeVerificationRegistry(): VerificationAdapterRegistry {
  const registry = VerificationAdapterRegistry.getInstance();

  registry.register(new GstVerificationAdapter());
  registry.register(new PanVerificationAdapter());
  registry.register(new UdyamVerificationAdapter());
  registry.register(new EpfoVerificationAdapter());
  registry.register(new EsicVerificationAdapter());
  registry.register(new IncomeTaxVerificationAdapter());
  registry.register(new StartupIndiaVerificationAdapter());
  registry.register(new NsicVerificationAdapter());
  registry.register(new OemVerificationAdapter());
  registry.register(new BlacklistVerificationAdapter());

  return registry;
}
