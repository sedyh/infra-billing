import { Button, Card, Group, Table, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAddRate, useRates, useRefreshRates } from '@/api/rates';
import { apiErrorMessage } from '@/api/client';
import { formatDate } from '@/utils/format';
import { notifyError, notifySuccess } from '@/utils/notify';

export function RatesCard() {
  const { t } = useTranslation();
  const { data: rates } = useRates();
  const addRate = useAddRate();
  const refresh = useRefreshRates();

  const rateForm = useForm({
    initialValues: { code: '', rate: '' },
    validate: {
      code: (v) => (/^[A-Za-z]{3}$/.test(v) ? null : t('validation.code3')),
      rate: (v) => (/^\d+(\.\d{1,8})?$/.test(v) ? null : t('validation.ratePositive')),
    },
  });

  const submitRate = rateForm.onSubmit(async (v) => {
    try {
      await addRate.mutateAsync({ code: v.code.toUpperCase(), rate: v.rate });
      rateForm.reset();
      notifySuccess(t('settings.rates.added'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  });

  const doRefresh = async () => {
    try {
      const res = await refresh.mutateAsync();
      notifySuccess(t('settings.rates.updated', { count: res.updated }));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="md">
        <Text fw={600}>{t('settings.rates.title')}</Text>
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          loading={refresh.isPending}
          onClick={doRefresh}
        >
          {t('settings.rates.refreshFromCbr')}
        </Button>
      </Group>

      <form onSubmit={submitRate}>
        <Group align="flex-end" mb="md">
          <TextInput
            label={t('settings.rates.code')}
            placeholder={t('settings.rates.codePlaceholder')}
            w={120}
            {...rateForm.getInputProps('code')}
          />
          <TextInput
            label={t('settings.rates.rate')}
            placeholder={t('settings.rates.ratePlaceholder')}
            w={160}
            {...rateForm.getInputProps('rate')}
          />
          <Button
            type="submit"
            variant="default"
            leftSection={<IconPlus size={16} />}
            loading={addRate.isPending}
          >
            {t('settings.rates.addManual')}
          </Button>
        </Group>
      </form>

      <Table.ScrollContainer minWidth={420}>
        <Table verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('settings.rates.thCurrency')}</Table.Th>
              <Table.Th>{t('settings.rates.thRate')}</Table.Th>
              <Table.Th>{t('settings.rates.thSource')}</Table.Th>
              <Table.Th>{t('settings.rates.thUpdated')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rates?.map((r) => (
              <Table.Tr key={r.code}>
                <Table.Td>{r.code}</Table.Td>
                <Table.Td>{r.rate}</Table.Td>
                <Table.Td>
                  {r.source === 'cbr'
                    ? t('settings.rates.sourceCbr')
                    : t('settings.rates.sourceManual')}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {formatDate(r.capturedAt)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
