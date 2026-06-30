import { Group, Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Dispatch, SetStateAction } from 'react';
import type { ServiceFilter } from '@/api/services';

interface ServicesFiltersProps {
  filter: ServiceFilter;
  setFilter: Dispatch<SetStateAction<ServiceFilter>>;
  providerOptions: { value: string; label: string }[];
  projectOptions: { value: string; label: string }[];
  typeOptions: { value: string; label: string }[];
}

export function ServicesFilters({
  filter,
  setFilter,
  providerOptions,
  projectOptions,
  typeOptions,
}: ServicesFiltersProps) {
  const { t } = useTranslation();
  return (
    <Group>
      <Select
        placeholder={t('services.filterAllProviders')}
        clearable
        data={providerOptions}
        value={filter.providerUuid ?? null}
        onChange={(v) => setFilter((f) => ({ ...f, providerUuid: v ?? undefined }))}
        w={220}
      />
      <Select
        placeholder={t('services.filterAllProjects')}
        clearable
        data={projectOptions}
        value={filter.projectUuid ?? null}
        onChange={(v) => setFilter((f) => ({ ...f, projectUuid: v ?? undefined }))}
        w={200}
      />
      <Select
        placeholder={t('services.filterAllTypes')}
        clearable
        data={typeOptions}
        value={filter.type ?? null}
        onChange={(v) => setFilter((f) => ({ ...f, type: v ?? undefined }))}
        w={200}
      />
      <Select
        placeholder={t('services.filterActivity')}
        clearable
        data={[
          { value: 'true', label: t('services.activityActive') },
          { value: 'false', label: t('services.activityInactive') },
        ]}
        value={filter.isActive === undefined ? null : String(filter.isActive)}
        onChange={(v) =>
          setFilter((f) => ({ ...f, isActive: v == null ? undefined : v === 'true' }))
        }
        w={160}
      />
    </Group>
  );
}
