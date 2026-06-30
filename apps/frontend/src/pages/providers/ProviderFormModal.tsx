import type { FormEventHandler } from 'react';
import { Button, Checkbox, Modal, Select, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { ProviderCredentialFields } from './ProviderCredentialFields';
import type { FormValues } from './providerForm';

interface ProviderFormModalProps {
  opened: boolean;
  editing: boolean;
  form: UseFormReturnType<FormValues>;
  kindOptions: { value: string; label: string }[];
  isPending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClose: () => void;
}

export function ProviderFormModal({
  opened,
  editing,
  form,
  kindOptions,
  isPending,
  onSubmit,
  onClose,
}: ProviderFormModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editing ? t('providers.modalEdit') : t('providers.modalCreate')}
    >
      <form onSubmit={onSubmit}>
        <Stack>
          <TextInput label={t('providers.field.name')} required {...form.getInputProps('name')} />
          {!editing && (
            <Select
              label={t('providers.field.type')}
              data={kindOptions}
              allowDeselect={false}
              {...form.getInputProps('kind')}
            />
          )}
          <ProviderCredentialFields form={form} editing={editing} />
          <TextInput
            label={t('providers.field.loginUrl')}
            description={t('providers.field.loginUrlDesc')}
            {...form.getInputProps('loginUrl')}
          />
          <Checkbox
            label={t('providers.field.isPostpaid')}
            description={t('providers.field.isPostpaidDesc')}
            {...form.getInputProps('isPostpaid', { type: 'checkbox' })}
          />
          <Button type="submit" loading={isPending}>
            {t('common.save')}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
