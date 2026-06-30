import { Button, Card, Group, NumberInput, Select, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { RateSource } from '@infra/shared';
import { apiErrorMessage } from '@/api/client';
import { useSettings, useUpdateSettings } from '@/api/settings';
import { CURRENCY_OPTIONS, useEnums } from '@/constants';
import { notifyError, notifySuccess } from '@/utils/notify';

interface SettingsForm {
  baseCurrency: string;
  syncIntervalHours: number;
  rateSource: string;
}

export function GeneralSettingsCard() {
  const { t } = useTranslation();
  const enums = useEnums();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();

  const rateSourceOptions = [
    { value: 'cbr', label: enums.rateSourceLabel('cbr') },
    { value: 'manual', label: enums.rateSourceLabel('manual') },
  ];

  const form = useForm<SettingsForm>({
    initialValues: { baseCurrency: 'RUB', syncIntervalHours: 6, rateSource: 'cbr' },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-seed the form only when settings load
  useEffect(() => {
    if (!settings) return;
    form.setValues({
      baseCurrency: settings.baseCurrency,
      syncIntervalHours: settings.syncIntervalHours,
      rateSource: settings.rateSource,
    });
  }, [settings]);

  const saveSettings = form.onSubmit(async (v) => {
    try {
      await updateSettings.mutateAsync({
        baseCurrency: v.baseCurrency,
        syncIntervalHours: v.syncIntervalHours,
        rateSource: v.rateSource as RateSource,
      });
      notifySuccess(t('settings.settingsSaved'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  });

  return (
    <Card withBorder radius="md" padding="lg">
      <form onSubmit={saveSettings}>
        <Stack>
          <Select
            label={t('settings.baseCurrency')}
            data={CURRENCY_OPTIONS}
            allowDeselect={false}
            {...form.getInputProps('baseCurrency')}
          />
          <NumberInput
            label={t('settings.syncInterval')}
            min={1}
            max={168}
            {...form.getInputProps('syncIntervalHours')}
          />
          <Select
            label={t('settings.rateSource')}
            data={rateSourceOptions}
            allowDeselect={false}
            {...form.getInputProps('rateSource')}
          />
          <Group justify="flex-end">
            <Button type="submit" loading={updateSettings.isPending}>
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
