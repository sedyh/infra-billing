import { Group, Select } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { Dispatch, SetStateAction } from 'react';
import type { PaymentFilter } from '@/api/payments';
import { toIso } from './paymentForm';

interface PaymentsFiltersProps {
  filter: PaymentFilter;
  setFilter: Dispatch<SetStateAction<PaymentFilter>>;
  providerOptions: { value: string; label: string }[];
}

export function PaymentsFilters({ filter, setFilter, providerOptions }: PaymentsFiltersProps) {
  const { t } = useTranslation();
  return (
    <Group align="flex-end">
      <Select
        label={t('payments.filterProvider')}
        placeholder={t('payments.filterAllProviders')}
        clearable
        data={providerOptions}
        value={filter.providerUuid ?? null}
        onChange={(v) => setFilter((f) => ({ ...f, providerUuid: v ?? undefined }))}
        w={220}
      />
      <DateInput
        label={t('payments.filterFrom')}
        placeholder={t('payments.datePlaceholder')}
        valueFormat="DD.MM.YYYY"
        clearable
        w={160}
        value={filter.from ? dayjs(filter.from).format('YYYY-MM-DD') : null}
        onChange={(v) => setFilter((f) => ({ ...f, from: v ? toIso(v) : undefined }))}
      />
      <DateInput
        label={t('payments.filterTo')}
        placeholder={t('payments.datePlaceholder')}
        valueFormat="DD.MM.YYYY"
        clearable
        w={160}
        value={filter.to ? dayjs(filter.to).format('YYYY-MM-DD') : null}
        onChange={(v) => setFilter((f) => ({ ...f, to: v ? toIso(v) : undefined }))}
      />
    </Group>
  );
}
