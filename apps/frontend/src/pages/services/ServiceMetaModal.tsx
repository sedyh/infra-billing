import { ActionIcon, CopyButton, Group, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Service } from '@infra/shared';
import { JsonView } from '@/components/JsonView';

// Raw provider `meta` JSON for a synced service, with a copy-to-clipboard button.
export function ServiceMetaModal({
  service,
  onClose,
}: {
  service: Service | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal
      opened={!!service}
      onClose={onClose}
      title={t('services.metaTitle', { name: service?.name ?? '' })}
      size="lg"
    >
      {service && Object.keys(service.meta ?? {}).length > 0 ? (
        <Stack gap="xs">
          <Group justify="flex-end">
            <CopyButton value={JSON.stringify(service.meta, null, 2)} timeout={1500}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? t('common.copied') : t('common.copy')}>
                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <JsonView data={service.meta} />
        </Stack>
      ) : (
        <Text c="dimmed" py="md" ta="center">
          {t('services.metaEmpty')}
        </Text>
      )}
    </Modal>
  );
}
