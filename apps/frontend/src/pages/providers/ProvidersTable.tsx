import { ActionIcon, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import {
  IconChartLine,
  IconEdit,
  IconExternalLink,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Provider } from '@infra/shared';
import { ProviderIcon } from '@/components/ProviderIcon';
import { providerFavicon } from '@/utils/favicon';
import { formatDate, formatMoney } from '@/utils/format';

interface ProvidersTableProps {
  providers: Provider[] | undefined;
  isLoading: boolean;
  syncingUuid: string | undefined;
  kindLabel: (kind: string) => string;
  onSync: (uuid: string) => void;
  onHistory: (p: Provider) => void;
  onEdit: (p: Provider) => void;
  onDelete: (p: Provider) => void;
}

export function ProvidersTable({
  providers,
  isLoading,
  syncingUuid,
  kindLabel,
  onSync,
  onHistory,
  onEdit,
  onDelete,
}: ProvidersTableProps) {
  const { t } = useTranslation();
  return (
    <Table.ScrollContainer minWidth={760}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('providers.th.name')}</Table.Th>
            <Table.Th>{t('providers.th.type')}</Table.Th>
            <Table.Th>{t('providers.th.balance')}</Table.Th>
            <Table.Th>{t('providers.th.services')}</Table.Th>
            <Table.Th>{t('providers.th.payments')}</Table.Th>
            <Table.Th>{t('providers.th.sync')}</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {providers?.map((p) => (
            <Table.Tr key={p.uuid}>
              <Table.Td>
                <Group gap="xs">
                  <ProviderIcon name={p.name} src={providerFavicon(p)} />
                  <Text fw={600}>{p.name}</Text>
                  {p.loginUrl && (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      component="a"
                      href={p.loginUrl}
                      target="_blank"
                    >
                      <IconExternalLink size={14} />
                    </ActionIcon>
                  )}
                </Group>
              </Table.Td>
              <Table.Td>
                <Badge
                  variant={p.kind === 'manual' ? 'default' : 'light'}
                  color={p.kind === 'manual' ? 'gray' : 'brand'}
                >
                  {kindLabel(p.kind)}
                </Badge>
              </Table.Td>
              <Table.Td>{formatMoney(p.balance, p.balanceCurrency)}</Table.Td>
              <Table.Td>{p.servicesCount ?? 0}</Table.Td>
              <Table.Td>{p.paymentsCount ?? 0}</Table.Td>
              <Table.Td>
                {p.lastSyncError ? (
                  <Tooltip label={p.lastSyncError} w={260} style={{ whiteSpace: 'normal' }}>
                    <Badge color="red" variant="light">
                      {t('providers.syncError')}
                    </Badge>
                  </Tooltip>
                ) : (
                  <Text size="sm" c="dimmed">
                    {formatDate(p.lastSyncAt)}
                  </Text>
                )}
              </Table.Td>
              <Table.Td>
                <Group gap={4} justify="flex-end" wrap="nowrap">
                  {p.kind !== 'manual' && (
                    <Tooltip label={t('common.refresh')}>
                      <ActionIcon
                        variant="subtle"
                        loading={syncingUuid === p.uuid}
                        onClick={() => onSync(p.uuid)}
                      >
                        <IconRefresh size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  {p.balance != null && (
                    <Tooltip label={t('providers.balanceHistory.tooltip')}>
                      <ActionIcon variant="subtle" onClick={() => onHistory(p)}>
                        <IconChartLine size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <ActionIcon variant="subtle" onClick={() => onEdit(p)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => onDelete(p)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
          {!isLoading && providers?.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={7}>
                <Text c="dimmed" ta="center" py="md">
                  {t('providers.empty')}
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
