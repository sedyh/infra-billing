import { useState } from 'react';
import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Provider, ProviderKind } from '@infra/shared';
import { apiErrorMessage } from '@/api/client';
import {
  useCreateProvider,
  useDeleteProvider,
  useProviders,
  useSyncAllProviders,
  useSyncProvider,
  useUpdateProvider,
} from '@/api/providers';
import { useSettings } from '@/api/settings';
import { useEnums } from '@/constants';
import { formatDate } from '@/utils/format';
import { notifyError, notifySuccess } from '@/utils/notify';
import { BalanceHistoryModal } from './BalanceHistoryModal';
import { ProviderFormModal } from './ProviderFormModal';
import { ProvidersTable } from './ProvidersTable';
import {
  EMPTY_FORM,
  type FormValues,
  buildCredentials,
  validateProviderCredentials,
} from './providerForm';

export function ProvidersPage() {
  const { t } = useTranslation();
  const enums = useEnums();
  const { data: providers, isLoading } = useProviders();
  const create = useCreateProvider();
  const update = useUpdateProvider();
  const del = useDeleteProvider();
  const sync = useSyncProvider();
  const syncAll = useSyncAllProviders();
  const { data: settings } = useSettings();
  const [opened, { open, close }] = useDisclosure(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [historyFor, setHistoryFor] = useState<Provider | null>(null);

  const form = useForm<FormValues>({
    initialValues: EMPTY_FORM,
    validate: { name: (v) => (v.trim() ? null : t('validation.enterName')) },
  });

  const openCreate = () => {
    setEditing(null);
    form.setValues({ ...EMPTY_FORM });
    open();
  };
  const openEdit = (p: Provider) => {
    setEditing(p);
    form.setValues({
      ...EMPTY_FORM,
      name: p.name,
      kind: p.kind,
      loginUrl: p.loginUrl ?? '',
      // Non-secret fields are prefilled; password/totpSecret stay blank ("keep unchanged").
      baseUrl: p.baseUrl ?? '',
      username: p.username ?? '',
      accountId: p.accountId ?? '',
      projectName: p.projectName ?? '',
      panelId: p.panelId ?? '',
      isPostpaid: p.isPostpaid,
    });
    open();
  };

  const doSync = async (uuid: string) => {
    try {
      const run = await sync.mutateAsync(uuid);
      if (run.status === 'ok')
        notifySuccess(t('providers.syncedOne', { count: run.servicesFound }));
      else notifyError((run.error ?? '').slice(0, 200) || t('providers.syncFailed'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  const submit = form.onSubmit(async (v) => {
    if (!editing) {
      const err = validateProviderCredentials(v, t);
      if (err) {
        notifyError(err);
        return;
      }
    }
    const creds = buildCredentials(v);
    try {
      let saved: Provider;
      if (editing) {
        saved = await update.mutateAsync({
          uuid: editing.uuid,
          dto: {
            name: v.name,
            loginUrl: v.loginUrl || undefined,
            isPostpaid: v.isPostpaid,
            ...creds,
          },
        });
      } else {
        saved = await create.mutateAsync({
          name: v.name,
          kind: v.kind as ProviderKind,
          loginUrl: v.loginUrl || undefined,
          isPostpaid: v.isPostpaid,
          ...creds,
        });
      }
      close();
      notifySuccess(editing ? t('providers.updated') : t('providers.created'));
      // Auto-sync syncable providers so credential/token changes take effect right away.
      if (saved.kind !== 'manual') void doSync(saved.uuid);
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  });

  const doSyncAll = async () => {
    try {
      const res = await syncAll.mutateAsync();
      if (res.failed === 0) notifySuccess(t('providers.syncedAll', { count: res.ok }));
      else notifyError(t('providers.syncedMixed', { ok: res.ok, failed: res.failed }));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  const doDelete = async (p: Provider) => {
    if (!window.confirm(t('providers.confirmDelete', { name: p.name }))) return;
    try {
      await del.mutateAsync(p.uuid);
      notifySuccess(t('common.deleted'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>{t('providers.title')}</Title>
          <Text c="dimmed">{t('providers.subtitle')}</Text>
          {settings?.nextSyncAt && (
            <Text c="dimmed" size="sm" mt={4}>
              {t('providers.nextSync', { when: formatDate(settings.nextSyncAt) })}
            </Text>
          )}
        </div>
        <Group>
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            loading={syncAll.isPending}
            onClick={doSyncAll}
          >
            {t('providers.syncAll')}
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            {t('common.add')}
          </Button>
        </Group>
      </Group>

      <ProvidersTable
        providers={providers}
        isLoading={isLoading}
        syncingUuid={sync.isPending ? sync.variables : undefined}
        kindLabel={enums.providerKindLabel}
        onSync={doSync}
        onHistory={setHistoryFor}
        onEdit={openEdit}
        onDelete={doDelete}
      />

      <ProviderFormModal
        opened={opened}
        editing={!!editing}
        form={form}
        kindOptions={enums.providerKindOptions}
        isPending={create.isPending || update.isPending}
        onSubmit={submit}
        onClose={close}
      />

      <BalanceHistoryModal provider={historyFor} onClose={() => setHistoryFor(null)} />
    </Stack>
  );
}
