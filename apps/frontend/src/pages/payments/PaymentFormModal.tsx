import { Button, Group, Modal, Select, Stack, TextInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import type { FormEventHandler } from 'react';
import { trimMoney } from '@/utils/format';
import type { PForm } from './paymentForm';

interface PaymentFormModalProps {
  opened: boolean;
  form: UseFormReturnType<PForm>;
  isPending: boolean;
  providerOptions: { value: string; label: string }[];
  serviceOptions: { value: string; label: string }[];
  currencyOptions: { value: string; label: string }[];
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClose: () => void;
}

export function PaymentFormModal({
  opened,
  form,
  isPending,
  providerOptions,
  serviceOptions,
  currencyOptions,
  onSubmit,
  onClose,
}: PaymentFormModalProps) {
  const { t } = useTranslation();
  return (
    <Modal opened={opened} onClose={onClose} title={t('payments.modalTitle')}>
      <form onSubmit={onSubmit}>
        <Stack>
          <Select
            label={t('payments.fieldProvider')}
            data={providerOptions}
            allowDeselect={false}
            {...form.getInputProps('providerUuid')}
          />
          <Select
            label={t('payments.fieldService', { optional: t('common.optional') })}
            placeholder={t('common.none')}
            clearable
            data={serviceOptions}
            {...form.getInputProps('serviceUuid')}
          />
          <Group grow>
            <TextInput
              label={t('payments.fieldAmount')}
              required
              {...form.getInputProps('amount')}
              onBlur={(e) => form.setFieldValue('amount', trimMoney(e.currentTarget.value))}
            />
            <Select
              label={t('payments.fieldCurrency')}
              data={currencyOptions}
              allowDeselect={false}
              {...form.getInputProps('currency')}
            />
          </Group>
          <DateInput
            label={t('payments.fieldDate')}
            required
            valueFormat="DD.MM.YYYY"
            placeholder={t('payments.datePlaceholder')}
            value={form.values.paymentDate || null}
            onChange={(v) => form.setFieldValue('paymentDate', v ?? '')}
            error={form.errors.paymentDate}
          />
          <Textarea
            label={t('payments.fieldDescription')}
            autosize
            minRows={2}
            {...form.getInputProps('description')}
          />
          <Button type="submit" loading={isPending}>
            {t('common.save')}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
