import type { ServiceType } from '@infra/shared';
import type { Icon } from '@tabler/icons-react';
import {
  IconBox,
  IconCloud,
  IconDatabase,
  IconLicense,
  IconNetwork,
  IconServer2,
  IconServerBolt,
  IconWorld,
} from '@tabler/icons-react';

// Only physically-hosted resources carry a country. Show the flag for these types only
// (domains/licenses/etc. would otherwise render a meaningless blank flag).
export const LOCATED_TYPES = new Set(['vps', 'dedicated']);

const TYPE_ICONS: Record<ServiceType, Icon> = {
  vps: IconServer2,
  dedicated: IconServerBolt,
  domain: IconWorld,
  cdn: IconNetwork,
  storage: IconCloud,
  db: IconDatabase,
  license: IconLicense,
  other: IconBox,
};

// Type icon shown in the leading slot for non-located services, where a country flag is meaningless.
export function ServiceTypeIcon({ type }: { type: ServiceType }) {
  const Cmp = TYPE_ICONS[type] ?? IconBox;
  return <Cmp size={18} stroke={1.5} color="var(--mantine-color-dimmed)" />;
}
