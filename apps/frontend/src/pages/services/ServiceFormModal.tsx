import { Button, Group, Modal, Select, Stack, Switch, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';
import { IconMapPin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { FormEventHandler } from 'react';
import type { Service } from '@infra/shared';
import { trimMoney } from '@/utils/format';
import type { SForm } from './serviceForm';

interface ServiceFormModalProps {
  opened: boolean;
  editing: Service | null;
  form: UseFormReturnType<SForm>;
  isPending: boolean;
  providerOptions: { value: string; label: string }[];
  projectOptions: { value: string; label: string }[];
  typeOptions: { value: string; label: string }[];
  periodOptions: { value: string; label: string }[];
  currencyOptions: { value: string; label: string }[];
  countryOptions: { value: string; label: string }[];
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClose: () => void;
}

export function ServiceFormModal({
  opened,
  editing,
  form,
  isPending,
  providerOptions,
  projectOptions,
  typeOptions,
  periodOptions,
  currencyOptions,
  countryOptions,
  onSubmit,
  onClose,
}: ServiceFormModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editing ? t('services.modalEdit') : t('services.modalCreate')}
    >
      <form onSubmit={onSubmit}>
        <Stack>
          <Select
            label={t('services.fieldProvider')}
            data={providerOptions}
            allowDeselect={false}
            // Synced services are matched by provider, so can't be reattached elsewhere.
            disabled={Boolean(editing?.isManaged)}
            description={editing?.isManaged ? t('services.providerLockedHint') : undefined}
            {...form.getInputProps('providerUuid')}
          />
          <Select
            label={t('services.fieldProject')}
            data={projectOptions}
            allowDeselect={false}
            {...form.getInputProps('projectUuid')}
          />
          <TextInput label={t('services.fieldName')} required {...form.getInputProps('name')} />
          <Group grow>
            <Select
              label={t('services.fieldType')}
              data={typeOptions}
              allowDeselect={false}
              {...form.getInputProps('type')}
            />
            <Select
              label={t('services.fieldPeriod')}
              data={periodOptions}
              allowDeselect={false}
              {...form.getInputProps('period')}
            />
          </Group>
          <Group grow>
            <TextInput
              label={t('services.fieldCost')}
              required
              {...form.getInputProps('cost')}
              onBlur={(e) => form.setFieldValue('cost', trimMoney(e.currentTarget.value))}
            />
            <Select
              label={t('services.fieldCurrency')}
              data={currencyOptions}
              allowDeselect={false}
              {...form.getInputProps('currency')}
            />
          </Group>
          <Group grow>
            <Select
              label={t('services.fieldCountry')}
              placeholder={t('services.countryPlaceholder')}
              searchable
              clearable
              data={countryOptions}
              leftSection={<IconMapPin size={16} />}
              {...form.getInputProps('countryCode')}
            />
            <DateInput
              label={t('services.fieldNextBilling')}
              clearable
              valueFormat="DD.MM.YYYY"
              placeholder={t('services.nextBillingPlaceholder')}
              value={form.values.nextBillingAt || null}
              onChange={(v) => form.setFieldValue('nextBillingAt', v ?? '')}
            />
          </Group>
          <Switch
            label={t('services.fieldActive')}
            {...form.getInputProps('isActive', { type: 'checkbox' })}
          />
          <Button type="submit" loading={isPending}>
            {t('common.save')}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
