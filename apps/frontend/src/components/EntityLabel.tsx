import { Group, Text } from '@mantine/core';
import { ProviderIcon } from '@/components/ProviderIcon';

// Provider/project favicon (or colored initial) + its name. The recurring leading cell in the
// services, payments, projects and dashboard tables.
export function EntityLabel({
  name,
  src,
  size = 18,
}: {
  name: string;
  src: string | null;
  size?: number;
}) {
  return (
    <Group gap={6} wrap="nowrap">
      <ProviderIcon name={name} src={src} size={size} />
      <Text size="sm">{name}</Text>
    </Group>
  );
}
