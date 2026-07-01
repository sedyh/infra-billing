import { ActionIcon, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import { IconBraces, IconEdit, IconReceipt2, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Project, Provider, Service } from '@infra/shared';
import { EntityLabel } from '@/components/EntityLabel';
import { projectFavicon, providerFavicon } from '@/utils/favicon';
import { countryFlag, formatDateShort, formatMoney, truncate } from '@/utils/format';
import { LOCATED_TYPES, ServiceTypeIcon } from './ServiceTypeIcon';

const NAME_MAX_LENGTH = 40;

interface ServicesTableProps {
  services: Service[] | undefined;
  isLoading: boolean;
  providerOf: (uuid: string) => Provider | undefined;
  projectOf: (uuid: string) => Project | undefined;
  serviceTypeLabel: (type: string) => string;
  periodLabel: (period: string) => string;
  onPayments: (s: Service) => void;
  onMeta: (s: Service) => void;
  onEdit: (s: Service) => void;
  onDelete: (s: Service) => void;
}

export function ServicesTable({
  services,
  isLoading,
  providerOf,
  projectOf,
  serviceTypeLabel,
  periodLabel,
  onPayments,
  onMeta,
  onEdit,
  onDelete,
}: ServicesTableProps) {
  const { t } = useTranslation();
  return (
    <Table.ScrollContainer minWidth={820}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('services.colName')}</Table.Th>
            <Table.Th>{t('services.colProvider')}</Table.Th>
            <Table.Th>{t('services.colProject')}</Table.Th>
            <Table.Th>{t('services.colType')}</Table.Th>
            <Table.Th>{t('services.colCost')}</Table.Th>
            <Table.Th>{t('services.colPeriod')}</Table.Th>
            <Table.Th>{t('services.colNextBilling')}</Table.Th>
            <Table.Th>{t('services.colSource')}</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {services?.map((s) => {
            const provider = providerOf(s.providerUuid);
            const project = projectOf(s.projectUuid);
            return (
              <Table.Tr key={s.uuid} style={{ opacity: s.isActive ? 1 : 0.5 }}>
                <Table.Td>
                  <Group gap={6}>
                    {LOCATED_TYPES.has(s.type) ? (
                      <span>{countryFlag(s.countryCode)}</span>
                    ) : (
                      <ServiceTypeIcon type={s.type} />
                    )}
                    <Tooltip label={s.name} disabled={s.name.length <= NAME_MAX_LENGTH}>
                      <Text fw={600}>{truncate(s.name, NAME_MAX_LENGTH)}</Text>
                    </Tooltip>
                    {!s.isActive && (
                      <Badge size="xs" color="gray">
                        {t('services.badgeInactive')}
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <EntityLabel
                    name={provider?.name ?? ''}
                    src={providerFavicon(provider ?? { faviconLink: null, loginUrl: null })}
                  />
                </Table.Td>
                <Table.Td>
                  <EntityLabel
                    name={project?.name ?? ''}
                    src={projectFavicon(project?.faviconLink ?? null)}
                  />
                </Table.Td>
                <Table.Td>{serviceTypeLabel(s.type)}</Table.Td>
                <Table.Td>{formatMoney(s.cost, s.currency)}</Table.Td>
                <Table.Td>{periodLabel(s.period)}</Table.Td>
                <Table.Td style={{ whiteSpace: 'nowrap' }}>
                  {formatDateShort(s.nextBillingAt)}
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant={s.isManaged ? 'light' : 'default'}
                    color={s.isManaged ? 'brand' : 'gray'}
                  >
                    {s.isManaged ? t('services.sourceManaged') : t('services.sourceManual')}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} justify="flex-end" wrap="nowrap">
                    {(s.paymentsCount ?? 0) > 0 && (
                      <Tooltip
                        label={t('services.paymentsTooltip', { count: s.paymentsCount ?? 0 })}
                      >
                        <ActionIcon variant="subtle" onClick={() => onPayments(s)}>
                          <IconReceipt2 size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {Object.keys(s.meta ?? {}).length > 0 && (
                      <Tooltip label={t('services.metaTooltip')}>
                        <ActionIcon variant="subtle" onClick={() => onMeta(s)}>
                          <IconBraces size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <ActionIcon variant="subtle" onClick={() => onEdit(s)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => onDelete(s)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
          {!isLoading && services?.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={9}>
                <Text c="dimmed" ta="center" py="md">
                  {t('services.empty')}
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
