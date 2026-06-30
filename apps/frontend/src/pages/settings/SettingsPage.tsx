import { SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { GeneralSettingsCard } from './GeneralSettingsCard';
import { RatesCard } from './RatesCard';
import { TelegramSettingsCard } from './TelegramSettingsCard';

export function SettingsPage() {
  const { t } = useTranslation();
  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>{t('settings.title')}</Title>
        <Text c="dimmed">{t('settings.subtitle')}</Text>
      </div>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <GeneralSettingsCard />
        <TelegramSettingsCard />
      </SimpleGrid>

      <RatesCard />
    </Stack>
  );
}
