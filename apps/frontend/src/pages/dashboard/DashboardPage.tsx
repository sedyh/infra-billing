import { SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useForecast, useSummary } from '@/api/analytics';
import { useProjects } from '@/api/projects';
import { useProviders } from '@/api/providers';
import { projectFavicon } from '@/utils/favicon';
import { ByProjectCard } from './ByProjectCard';
import { ByProviderCard } from './ByProviderCard';
import { DashboardAlerts } from './DashboardAlerts';
import { ForecastCard } from './ForecastCard';
import { KpiCards } from './KpiCards';
import { RunwayCard } from './RunwayCard';
import { SpendByTypeCard } from './SpendByTypeCard';
import { UpcomingBillingsCard } from './UpcomingBillingsCard';

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: summary, isLoading } = useSummary();
  const { data: forecast } = useForecast(6, 3);
  const { data: providers } = useProviders();
  const { data: projectsList } = useProjects();
  const providerOf = (uuid: string) => providers?.find((p) => p.uuid === uuid);
  const projectIconOf = (uuid: string) =>
    projectFavicon(projectsList?.find((p) => p.uuid === uuid)?.faviconLink ?? null);
  const base = summary?.baseCurrency ?? '';

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>{t('dashboard.title')}</Title>
        <Text c="dimmed">{t('dashboard.subtitle')}</Text>
      </div>

      <KpiCards summary={summary} base={base} />

      <DashboardAlerts
        upcoming={summary?.upcomingBillings ?? []}
        runway={summary?.balanceRunway ?? []}
      />

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SpendByTypeCard byType={summary?.byType ?? []} base={base} isLoading={isLoading} />
        <ForecastCard forecast={forecast} base={base} />
      </SimpleGrid>

      <ByProjectCard
        projectRows={summary?.byProject ?? []}
        base={base}
        isLoading={isLoading}
        projectIconOf={projectIconOf}
      />

      <ByProviderCard
        providerRows={summary?.byProvider ?? []}
        base={base}
        isLoading={isLoading}
        providerOf={providerOf}
      />

      <UpcomingBillingsCard upcoming={summary?.upcomingBillings ?? []} />

      <RunwayCard runway={summary?.balanceRunway ?? []} />
    </Stack>
  );
}
