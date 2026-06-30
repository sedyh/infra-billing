import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PROJECT_UUID, type Period, type Service, type ServiceType } from '@infra/shared';
import { apiErrorMessage } from '@/api/client';
import { useProjects } from '@/api/projects';
import { useProviders } from '@/api/providers';
import {
  type ServiceFilter,
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
} from '@/api/services';
import { useEnums } from '@/constants';
import { useCountryOptions } from '@/utils/countries';
import { trimMoney } from '@/utils/format';
import { notifyError, notifySuccess } from '@/utils/notify';
import { ServiceFormModal } from './ServiceFormModal';
import { ServiceMetaModal } from './ServiceMetaModal';
import { ServicePaymentsModal } from './ServicePaymentsModal';
import { ServicesFilters } from './ServicesFilters';
import { ServicesTable } from './ServicesTable';
import { type SForm, toIso } from './serviceForm';

export function ServicesPage() {
  const { t } = useTranslation();
  const enums = useEnums();
  const countryOptions = useCountryOptions();
  const { data: providers } = useProviders();
  const { data: projects } = useProjects();
  const [filter, setFilter] = useState<ServiceFilter>({});
  const { data: services, isLoading } = useServices(filter);
  const create = useCreateService();
  const update = useUpdateService();
  const del = useDeleteService();
  const [opened, { open, close }] = useDisclosure(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [paymentsFor, setPaymentsFor] = useState<Service | null>(null);
  const [metaFor, setMetaFor] = useState<Service | null>(null);

  const providerOptions = (providers ?? []).map((p) => ({ value: p.uuid, label: p.name }));
  const providerOf = (uuid: string) => providers?.find((p) => p.uuid === uuid);
  const projectOptions = (projects ?? []).map((p) => ({ value: p.uuid, label: p.name }));
  const projectOf = (uuid: string) => projects?.find((p) => p.uuid === uuid);
  // Default a new service to the default project (or the first one).
  const defaultProjectUuid =
    projects?.find((p) => p.uuid === DEFAULT_PROJECT_UUID)?.uuid ?? projectOptions[0]?.value ?? '';

  const form = useForm<SForm>({
    initialValues: {
      providerUuid: '',
      projectUuid: '',
      name: '',
      type: 'vps',
      cost: '',
      currency: 'RUB',
      period: 'monthly',
      countryCode: '',
      nextBillingAt: '',
      isActive: true,
    },
    validate: {
      name: (v) => (v.trim() ? null : t('validation.enterName')),
      // Accept any number of decimals. Extra ones are trimmed to 2 (on blur + submit).
      cost: (v) => (/^\d+(\.\d+)?$/.test(v) ? null : t('validation.amountFormat')),
      providerUuid: (v) => (v ? null : t('validation.selectProvider')),
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.setValues({
      providerUuid: providerOptions[0]?.value ?? '',
      projectUuid: defaultProjectUuid,
      name: '',
      type: 'vps',
      cost: '',
      currency: 'RUB',
      period: 'monthly',
      countryCode: '',
      nextBillingAt: '',
      isActive: true,
    });
    open();
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    form.setValues({
      providerUuid: s.providerUuid,
      projectUuid: s.projectUuid,
      name: s.name,
      type: s.type,
      cost: s.cost,
      currency: s.currency,
      period: s.period,
      countryCode: s.countryCode ?? '',
      nextBillingAt: s.nextBillingAt ? dayjs(s.nextBillingAt).format('YYYY-MM-DD') : '',
      isActive: s.isActive,
    });
    open();
  };

  const submit = form.onSubmit(async (v) => {
    try {
      if (editing) {
        await update.mutateAsync({
          uuid: editing.uuid,
          dto: {
            providerUuid: v.providerUuid,
            projectUuid: v.projectUuid,
            name: v.name,
            type: v.type as ServiceType,
            cost: trimMoney(v.cost),
            currency: v.currency,
            period: v.period as Period,
            countryCode: v.countryCode || null,
            nextBillingAt: toIso(v.nextBillingAt) ?? null,
            isActive: v.isActive,
          },
        });
      } else {
        await create.mutateAsync({
          providerUuid: v.providerUuid,
          projectUuid: v.projectUuid,
          name: v.name,
          type: v.type as ServiceType,
          cost: trimMoney(v.cost),
          currency: v.currency,
          period: v.period as Period,
          countryCode: v.countryCode || undefined,
          nextBillingAt: toIso(v.nextBillingAt),
          isActive: v.isActive,
        });
      }
      close();
      notifySuccess(editing ? t('services.updatedToast') : t('services.createdToast'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  });

  const doDelete = async (s: Service) => {
    if (!window.confirm(t('services.confirmDelete', { name: s.name }))) return;
    try {
      await del.mutateAsync(s.uuid);
      notifySuccess(t('common.deleted'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>{t('services.title')}</Title>
          <Text c="dimmed">{t('services.subtitle')}</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreate}
          disabled={providerOptions.length === 0}
        >
          {t('common.add')}
        </Button>
      </Group>

      <ServicesFilters
        filter={filter}
        setFilter={setFilter}
        providerOptions={providerOptions}
        projectOptions={projectOptions}
        typeOptions={enums.serviceTypeOptions}
      />

      <ServicesTable
        services={services}
        isLoading={isLoading}
        providerOf={providerOf}
        projectOf={projectOf}
        serviceTypeLabel={enums.serviceTypeLabel}
        periodLabel={enums.periodLabel}
        onPayments={setPaymentsFor}
        onMeta={setMetaFor}
        onEdit={openEdit}
        onDelete={doDelete}
      />

      <ServiceFormModal
        opened={opened}
        editing={editing}
        form={form}
        isPending={create.isPending || update.isPending}
        providerOptions={providerOptions}
        projectOptions={projectOptions}
        typeOptions={enums.serviceTypeOptions}
        periodOptions={enums.periodOptions}
        currencyOptions={enums.currencyOptions}
        countryOptions={countryOptions}
        onSubmit={submit}
        onClose={close}
      />

      <ServicePaymentsModal service={paymentsFor} onClose={() => setPaymentsFor(null)} />
      <ServiceMetaModal service={metaFor} onClose={() => setMetaFor(null)} />
    </Stack>
  );
}
