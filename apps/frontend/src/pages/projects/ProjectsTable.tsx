import { ActionIcon, Badge, CopyButton, Group, Table, Text, Tooltip } from '@mantine/core';
import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconFolderMinus,
  IconFolderPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PROJECT_UUID, type Project } from '@infra/shared';
import { ProviderIcon } from '@/components/ProviderIcon';
import { projectFavicon } from '@/utils/favicon';

interface ProjectsTableProps {
  projects: Project[] | undefined;
  isLoading: boolean;
  moving: boolean;
  emptying: boolean;
  onMoveAll: (p: Project) => void;
  onRemoveAll: (p: Project) => void;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}

export function ProjectsTable({
  projects,
  isLoading,
  moving,
  emptying,
  onMoveAll,
  onRemoveAll,
  onEdit,
  onDelete,
}: ProjectsTableProps) {
  const { t } = useTranslation();
  return (
    <Table.ScrollContainer minWidth={520}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('projects.colName')}</Table.Th>
            <Table.Th ta="end">{t('projects.colServices')}</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {projects?.map((p) => {
            const isDefault = p.uuid === DEFAULT_PROJECT_UUID;
            return (
              <Table.Tr key={p.uuid}>
                <Table.Td>
                  <Group gap={8} wrap="nowrap">
                    <ProviderIcon name={p.name} src={projectFavicon(p.faviconLink)} size={20} />
                    <Text fw={600}>{p.name}</Text>
                    {isDefault && (
                      <Badge size="xs" variant="light" color="gray">
                        {t('projects.defaultBadge')}
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td ta="end">{p.servicesCount ?? 0}</Table.Td>
                <Table.Td>
                  <Group gap={4} justify="flex-end" wrap="nowrap">
                    <CopyButton value={p.uuid}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? t('projects.uuidCopied') : t('projects.copyUuid')}>
                          <ActionIcon variant="subtle" color="gray" onClick={copy}>
                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                    <Tooltip label={t('projects.actionMoveAll')}>
                      <ActionIcon
                        variant="subtle"
                        color="green"
                        loading={moving}
                        onClick={() => onMoveAll(p)}
                      >
                        <IconFolderPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                    {!isDefault && (
                      <Tooltip label={t('projects.actionRemoveAll')}>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          loading={emptying}
                          onClick={() => onRemoveAll(p)}
                        >
                          <IconFolderMinus size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <ActionIcon variant="subtle" onClick={() => onEdit(p)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    {!isDefault && (
                      <ActionIcon variant="subtle" color="red" onClick={() => onDelete(p)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
          {!isLoading && projects?.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text c="dimmed" ta="center" py="md">
                  {t('projects.empty')}
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
