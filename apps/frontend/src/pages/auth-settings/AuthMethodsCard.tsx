import {
  Alert,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconAlertTriangle, IconFingerprint, IconLock, IconPassword } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { MethodRow } from './MethodRow';

export interface MethodsFormValues {
  passwordEnabled: boolean;
  passkeyEnabled: boolean;
  rpId: string;
  rpName: string;
  rpOrigin: string;
}

interface AuthMethodsCardProps {
  form: UseFormReturnType<MethodsFormValues>;
  pkOpen: boolean;
  onTogglePk: () => void;
  onUseCurrentHost: () => void;
  onSave: () => void;
  saving: boolean;
}

// Password is a plain on/off toggle; passkey expands to its WebAuthn relying-party settings.
export function AuthMethodsCard({
  form,
  pkOpen,
  onTogglePk,
  onUseCurrentHost,
  onSave,
  saving,
}: AuthMethodsCardProps) {
  const { t } = useTranslation();
  return (
    <Card withBorder radius="md" padding="lg">
      <Group gap="sm" wrap="nowrap" mb="xs">
        <ThemeIcon variant="light" color="brand" radius="md" size="lg">
          <IconLock size={20} stroke={1.5} />
        </ThemeIcon>
        <div>
          <Text fw={600}>{t('auth.methods.title')}</Text>
          <Text size="xs" c="dimmed">
            {t('auth.methods.subtitle')}
          </Text>
        </div>
      </Group>
      <Divider />

      <MethodRow
        icon={IconPassword}
        title={t('auth.methods.password')}
        description={t('auth.methods.passwordDescription')}
        enabled={form.values.passwordEnabled}
        onToggle={(v) => form.setFieldValue('passwordEnabled', v)}
      />

      <Divider />

      <MethodRow
        icon={IconFingerprint}
        title={t('auth.methods.passkey')}
        description={t('auth.methods.passkeyDescription')}
        enabled={form.values.passkeyEnabled}
        onToggle={(v) => form.setFieldValue('passkeyEnabled', v)}
        opened={pkOpen}
        onToggleOpen={onTogglePk}
      >
        <Stack gap="sm">
          <Alert variant="light" color="yellow" icon={<IconAlertTriangle size={18} />} p="sm">
            {t('auth.methods.warning')}
          </Alert>
          <TextInput
            label={t('auth.methods.rpId')}
            description={t('auth.methods.rpIdDescription')}
            placeholder="example.com"
            {...form.getInputProps('rpId')}
          />
          <TextInput
            label={t('auth.methods.rpName')}
            placeholder="Infra Billing"
            {...form.getInputProps('rpName')}
          />
          <TextInput
            label={t('auth.methods.rpOrigin')}
            description={t('auth.methods.rpOriginDescription')}
            placeholder="https://example.com"
            {...form.getInputProps('rpOrigin')}
          />
          <Group>
            <Button variant="subtle" size="compact-sm" onClick={onUseCurrentHost}>
              {t('auth.methods.useCurrent')}
            </Button>
          </Group>
        </Stack>
      </MethodRow>

      <Group justify="flex-end" mt="md">
        <Button onClick={onSave} loading={saving}>
          {t('common.save')}
        </Button>
      </Group>
    </Card>
  );
}
