import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Project } from '@infra/shared';
import { apiErrorMessage } from '@/api/client';
import {
  useCreateProject,
  useDeleteProject,
  useEmptyProject,
  useMoveAllToProject,
  useProjects,
  useUpdateProject,
} from '@/api/projects';
import { notifyError, notifySuccess } from '@/utils/notify';
import { ProjectFormModal } from './ProjectFormModal';
import { ProjectsTable } from './ProjectsTable';

export function ProjectsPage() {
  const { t } = useTranslation();
  const { data: projects, isLoading } = useProjects();
  const create = useCreateProject();
  const update = useUpdateProject();
  const del = useDeleteProject();
  const moveAll = useMoveAllToProject();
  const empty = useEmptyProject();
  const [opened, { open, close }] = useDisclosure(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const form = useForm<{ name: string; faviconLink: string }>({
    initialValues: { name: '', faviconLink: '' },
    validate: { name: (v) => (v.trim() ? null : t('validation.enterName')) },
  });

  const openCreate = () => {
    setEditing(null);
    form.setValues({ name: '', faviconLink: '' });
    open();
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    form.setValues({ name: p.name, faviconLink: p.faviconLink ?? '' });
    open();
  };

  const submit = form.onSubmit(async (v) => {
    const dto = { name: v.name.trim(), faviconLink: v.faviconLink.trim() || null };
    try {
      if (editing) {
        await update.mutateAsync({ uuid: editing.uuid, dto });
      } else {
        await create.mutateAsync({ name: dto.name, faviconLink: dto.faviconLink ?? undefined });
      }
      close();
      notifySuccess(editing ? t('projects.updated') : t('projects.created'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  });

  const doDelete = async (p: Project) => {
    if (!window.confirm(t('projects.confirmDelete', { name: p.name }))) return;
    try {
      await del.mutateAsync(p.uuid);
      notifySuccess(t('common.deleted'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  const doMoveAll = async (p: Project) => {
    if (!window.confirm(t('projects.confirmMoveAll', { name: p.name }))) return;
    try {
      const { moved } = await moveAll.mutateAsync(p.uuid);
      notifySuccess(t('projects.movedToast', { count: moved }));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  const doRemoveAll = async (p: Project) => {
    if (!window.confirm(t('projects.confirmRemoveAll', { name: p.name }))) return;
    try {
      const { moved } = await empty.mutateAsync(p.uuid);
      notifySuccess(t('projects.movedToast', { count: moved }));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>{t('projects.title')}</Title>
          <Text c="dimmed">{t('projects.subtitle')}</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          {t('common.add')}
        </Button>
      </Group>

      <ProjectsTable
        projects={projects}
        isLoading={isLoading}
        moving={moveAll.isPending}
        emptying={empty.isPending}
        onMoveAll={doMoveAll}
        onRemoveAll={doRemoveAll}
        onEdit={openEdit}
        onDelete={doDelete}
      />

      <ProjectFormModal
        opened={opened}
        editing={editing}
        form={form}
        isPending={create.isPending || update.isPending}
        onSubmit={submit}
        onClose={close}
      />
    </Stack>
  );
}
