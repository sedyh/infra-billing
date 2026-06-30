import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { IconFingerprint, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Passkey } from '@infra/shared';
import { formatDate } from '@/utils/format';

interface PasskeysCardProps {
  passkeys: Passkey[] | undefined;
  canPasskey: boolean;
  adding: boolean;
  removing: boolean;
  onAdd: () => void;
  onRemove: (pk: Passkey) => void;
}

export function PasskeysCard({
  passkeys,
  canPasskey,
  adding,
  removing,
  onAdd,
  onRemove,
}: PasskeysCardProps) {
  const { t } = useTranslation();
  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="md">
        <Text fw={600}>{t('auth.passkeys.title')}</Text>
        <Tooltip label={t('auth.passkeys.unsupported')} disabled={canPasskey}>
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            disabled={!canPasskey}
            loading={adding}
            onClick={onAdd}
          >
            {t('auth.passkeys.add')}
          </Button>
        </Tooltip>
      </Group>

      {passkeys && passkeys.length > 0 ? (
        <Stack gap="xs">
          {passkeys.map((pk) => (
            <Group key={pk.uuid} justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon variant="light" color="brand" radius="md">
                  <IconFingerprint size={18} />
                </ThemeIcon>
                <div>
                  <Group gap="xs">
                    <Text fw={500}>{pk.name ?? t('auth.passkeys.unnamed')}</Text>
                    {pk.backedUp && (
                      <Badge size="sm" variant="light" color="teal">
                        {t('auth.passkeys.backedUp')}
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {t('auth.passkeys.created', { date: formatDate(pk.createdAt) })}
                    {' · '}
                    {pk.lastUsedAt
                      ? t('auth.passkeys.lastUsed', { date: formatDate(pk.lastUsedAt) })
                      : t('auth.passkeys.neverUsed')}
                  </Text>
                </div>
              </Group>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => onRemove(pk)}
                loading={removing}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text c="dimmed" size="sm">
          {t('auth.passkeys.empty')}
        </Text>
      )}
    </Card>
  );
}
