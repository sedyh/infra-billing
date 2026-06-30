import { Button, Group, Pagination, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiErrorMessage } from '@/api/client';
import {
  type PaymentFilter,
  useCreatePayment,
  useDeletePayment,
  usePayments,
} from '@/api/payments';
import { useProviders } from '@/api/providers';
import { useServices } from '@/api/services';
import { useEnums } from '@/constants';
import { trimMoney } from '@/utils/format';
import { notifyError, notifySuccess } from '@/utils/notify';
import { PaymentFormModal } from './PaymentFormModal';
import { PaymentsFilters } from './PaymentsFilters';
import { PaymentsTable } from './PaymentsTable';
import { type PForm, toIso } from './paymentForm';

const PAGE_SIZE = 50;

export function PaymentsPage() {
  const { t } = useTranslation();
  const enums = useEnums();
  const { data: providers } = useProviders();
  const [filter, setFilter] = useState<PaymentFilter>({});
  const [page, setPage] = useState(1);
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset page only when the filter changes
  useEffect(() => setPage(1), [filter]);
  const { data, isLoading } = usePayments(filter, { page, pageSize: PAGE_SIZE });
  const payments = data?.items ?? [];
  const total = data?.total ?? 0;
  const create = useCreatePayment();
  const del = useDeletePayment();
  const [opened, { open, close }] = useDisclosure(false);

  const providerOptions = (providers ?? []).map((p) => ({ value: p.uuid, label: p.name }));
  const providerOf = (uuid: string) => providers?.find((p) => p.uuid === uuid);

  const form = useForm<PForm>({
    initialValues: {
      providerUuid: '',
      serviceUuid: '',
      amount: '',
      currency: 'RUB',
      paymentDate: dayjs().format('YYYY-MM-DD'),
      description: '',
    },
    validate: {
      providerUuid: (v) => (v ? null : t('validation.selectProvider')),
      // Accept any number of decimals. Extra ones are trimmed to 2 (on blur + submit).
      amount: (v) => (/^\d+(\.\d+)?$/.test(v) ? null : t('validation.amountFormat')),
      paymentDate: (v) => (v ? null : t('validation.enterDate')),
    },
  });

  const formServices = useServices({ providerUuid: form.values.providerUuid || undefined });
  const serviceOptions = (formServices.data ?? []).map((s) => ({ value: s.uuid, label: s.name }));

  const openCreate = () => {
    form.setValues({
      providerUuid: providerOptions[0]?.value ?? '',
      serviceUuid: '',
      amount: '',
      currency: 'RUB',
      paymentDate: dayjs().format('YYYY-MM-DD'),
      description: '',
    });
    open();
  };

  const submit = form.onSubmit(async (v) => {
    try {
      await create.mutateAsync({
        providerUuid: v.providerUuid,
        serviceUuid: v.serviceUuid || undefined,
        amount: trimMoney(v.amount),
        currency: v.currency,
        paymentDate: toIso(v.paymentDate)!,
        description: v.description || undefined,
      });
      close();
      notifySuccess(t('payments.created'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  });

  const doDelete = async (uuid: string) => {
    if (!window.confirm(t('payments.confirmDelete'))) return;
    try {
      await del.mutateAsync(uuid);
      notifySuccess(t('common.deleted'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>{t('payments.title')}</Title>
          <Text c="dimmed">{t('payments.subtitle')}</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreate}
          disabled={providerOptions.length === 0}
        >
          {t('common.add')}
        </Button>
      </Group>

      <PaymentsFilters filter={filter} setFilter={setFilter} providerOptions={providerOptions} />

      <PaymentsTable
        payments={payments}
        isLoading={isLoading}
        total={total}
        providerOf={providerOf}
        onDelete={doDelete}
      />

      {total > PAGE_SIZE && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('payments.total', { count: total })}
          </Text>
          <Pagination total={Math.ceil(total / PAGE_SIZE)} value={page} onChange={setPage} />
        </Group>
      )}

      <PaymentFormModal
        opened={opened}
        form={form}
        isPending={create.isPending}
        providerOptions={providerOptions}
        serviceOptions={serviceOptions}
        currencyOptions={enums.currencyOptions}
        onSubmit={submit}
        onClose={close}
      />
    </Stack>
  );
}
