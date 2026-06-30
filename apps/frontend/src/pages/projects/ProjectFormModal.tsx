import { Button, Modal, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import type { FormEventHandler } from 'react';
import type { Project } from '@infra/shared';

interface ProjectFormModalProps {
  opened: boolean;
  editing: Project | null;
  form: UseFormReturnType<{ name: string; faviconLink: string }>;
  isPending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClose: () => void;
}

export function ProjectFormModal({
  opened,
  editing,
  form,
  isPending,
  onSubmit,
  onClose,
}: ProjectFormModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editing ? t('projects.modalEdit') : t('projects.modalCreate')}
    >
      <form onSubmit={onSubmit}>
        <Stack>
          <TextInput
            label={t('projects.fieldName')}
            placeholder={t('projects.namePlaceholder')}
            required
            data-autofocus
            {...form.getInputProps('name')}
          />
          <TextInput
            label={t('projects.fieldFavicon')}
            description={t('projects.faviconHint')}
            placeholder={t('projects.faviconPlaceholder')}
            {...form.getInputProps('faviconLink')}
          />
          <Button type="submit" loading={isPending}>
            {t('common.save')}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
