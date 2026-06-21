import { type ReactNode, useLayoutEffect } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Collapse,
  Divider,
  Grid,
  Loader,
  Group,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import {
  IconAlertTriangle,
  IconChevronDown,
  IconFingerprint,
  type Icon,
  IconLock,
  IconPassword,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import type { Passkey } from '@infra/shared';
import {
  useAuthConfig,
  useDeletePasskey,
  usePasskeys,
  useRegisterPasskey,
  useUpdateAuthConfig,
} from '@/api/authSettings';
import { apiErrorMessage } from '@/api/client';
import { mapPasskeyError, passkeySupported } from '@/api/webauthn';
import { notifyError, notifySuccess } from '@/utils/notify';
import { formatDate } from '@/utils/format';

/**
 * One sign-in method row: icon + label on the left, enable switch on the right. Rows that carry
 * configuration (passkey) also get an expand chevron and a collapsible body; plain on/off rows
 * (password) omit both — the switch is the whole control.
 */
function MethodRow({
  icon: RowIcon,
  title,
  description,
  enabled,
  onToggle,
  opened,
  onToggleOpen,
  children,
}: {
  icon: Icon;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  opened?: boolean;
  onToggleOpen?: () => void;
  children?: ReactNode;
}) {
  const expandable = onToggleOpen !== undefined;
  const label = (
    <Group gap="sm" wrap="nowrap">
      <ThemeIcon variant="light" color="brand" radius="md" size="lg">
        <RowIcon size={20} stroke={1.5} />
      </ThemeIcon>
      <div>
        <Text fw={500}>{title}</Text>
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      </div>
    </Group>
  );
  return (
    <div>
      <Group justify="space-between" wrap="nowrap" py="sm">
        {/* When expandable, the whole label toggles the section — only the switch is exempt. */}
        {expandable ? (
          <UnstyledButton onClick={onToggleOpen} style={{ flex: 1 }} aria-expanded={opened}>
            {label}
          </UnstyledButton>
        ) : (
          <div style={{ flex: 1 }}>{label}</div>
        )}
        <Group gap="xs" wrap="nowrap">
          {expandable && (
            <ActionIcon variant="subtle" color="gray" onClick={onToggleOpen} aria-label={title}>
              <IconChevronDown
                size={18}
                style={{
                  transform: opened ? 'rotate(180deg)' : undefined,
                  transition: 'transform 150ms ease',
                }}
              />
            </ActionIcon>
          )}
          <Switch
            checked={enabled}
            onChange={(e) => onToggle(e.currentTarget.checked)}
            aria-label={title}
          />
        </Group>
      </Group>
      {expandable && (
        <Collapse expanded={!!opened}>
          <div style={{ paddingBottom: 'var(--mantine-spacing-md)' }}>{children}</div>
        </Collapse>
      )}
    </div>
  );
}

export function AuthSettingsPage() {
  const { t } = useTranslation();
  const { data: config } = useAuthConfig();
  const { data: passkeys } = usePasskeys();
  const updateConfig = useUpdateAuthConfig();
  const registerPasskey = useRegisterPasskey();
  const deletePasskey = useDeletePasskey();

  const canPasskey = passkeySupported();
  const [pkOpen, pkDisc] = useDisclosure(false);

  const methodsForm = useForm({
    initialValues: {
      passwordEnabled: true,
      passkeyEnabled: false,
      rpId: '',
      rpName: '',
      rpOrigin: '',
    },
  });

  // useLayoutEffect (not useEffect) so the seeded values are committed before the browser paints.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-seed the form only when config loads
  useLayoutEffect(() => {
    if (!config) return;
    methodsForm.setValues({
      passwordEnabled: config.passwordEnabled,
      passkeyEnabled: config.passkeyEnabled,
      rpId: config.rpId,
      rpName: config.rpName,
      rpOrigin: config.rpOrigin,
    });
  }, [config]);

  const useCurrentHost = () => {
    methodsForm.setValues({
      ...methodsForm.values,
      rpId: window.location.hostname,
      rpName: methodsForm.values.rpName || 'Infra Billing',
      rpOrigin: window.location.origin,
    });
  };

  const saveMethods = async () => {
    const v = methodsForm.values;
    // Mirror the backend lockout invariant for instant feedback.
    if (!v.passwordEnabled && !v.passkeyEnabled) {
      notifyError(t('auth.methods.lastMethodError'));
      return;
    }
    if (!v.passwordEnabled && (passkeys?.length ?? 0) === 0) {
      notifyError(t('auth.methods.needPasskeyFirst'));
      return;
    }
    try {
      await updateConfig.mutateAsync({
        passwordEnabled: v.passwordEnabled,
        passkeyEnabled: v.passkeyEnabled,
        rpId: v.rpId,
        rpName: v.rpName,
        rpOrigin: v.rpOrigin,
      });
      notifySuccess(t('auth.methods.saved'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  // No name prompt: trigger the ceremony straight away. We auto-name the key ("Passkey", "Passkey 2", …).
  const addPasskey = async () => {
    try {
      await registerPasskey.mutateAsync(undefined);
      notifySuccess(t('auth.passkeys.added'));
    } catch (e) {
      const m = mapPasskeyError(e);
      if (!m.cancelled) notifyError(apiErrorMessage(e, m.message));
    }
  };

  const removePasskey = async (pk: Passkey) => {
    if (!config?.passwordEnabled && (passkeys?.length ?? 0) <= 1) {
      notifyError(t('auth.passkeys.lastMethodError'));
      return;
    }
    const label = pk.name ?? t('auth.passkeys.unnamed');
    if (!window.confirm(t('auth.passkeys.confirmDelete', { name: label }))) return;
    try {
      await deletePasskey.mutateAsync(pk.uuid);
      notifySuccess(t('common.deleted'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  // Wait for the real config before rendering toggles — avoids a flash of the default
  // (password on / passkey off) state for a passkey-only owner.
  if (!config) {
    return (
      <Center h={240}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>{t('auth.title')}</Title>
        <Text c="dimmed">{t('auth.subtitle')}</Text>
      </div>

      <Grid gap="lg">
        {/* Left: sign-in methods. Password is a plain on/off toggle; passkey expands to its settings. */}
        <Grid.Col span={{ base: 12, md: 7 }}>
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
              enabled={methodsForm.values.passwordEnabled}
              onToggle={(v) => methodsForm.setFieldValue('passwordEnabled', v)}
            />

            <Divider />

            <MethodRow
              icon={IconFingerprint}
              title={t('auth.methods.passkey')}
              description={t('auth.methods.passkeyDescription')}
              enabled={methodsForm.values.passkeyEnabled}
              onToggle={(v) => methodsForm.setFieldValue('passkeyEnabled', v)}
              opened={pkOpen}
              onToggleOpen={pkDisc.toggle}
            >
              <Stack gap="sm">
                <Alert variant="light" color="yellow" icon={<IconAlertTriangle size={18} />} p="sm">
                  {t('auth.methods.warning')}
                </Alert>
                <TextInput
                  label={t('auth.methods.rpId')}
                  description={t('auth.methods.rpIdDescription')}
                  placeholder="example.com"
                  {...methodsForm.getInputProps('rpId')}
                />
                <TextInput
                  label={t('auth.methods.rpName')}
                  placeholder="Infra Billing"
                  {...methodsForm.getInputProps('rpName')}
                />
                <TextInput
                  label={t('auth.methods.rpOrigin')}
                  description={t('auth.methods.rpOriginDescription')}
                  placeholder="https://example.com"
                  {...methodsForm.getInputProps('rpOrigin')}
                />
                <Group>
                  <Button variant="subtle" size="compact-sm" onClick={useCurrentHost}>
                    {t('auth.methods.useCurrent')}
                  </Button>
                </Group>
              </Stack>
            </MethodRow>

            <Group justify="flex-end" mt="md">
              <Button onClick={saveMethods} loading={updateConfig.isPending}>
                {t('common.save')}
              </Button>
            </Group>
          </Card>
        </Grid.Col>

        {/* Right: passkey keys — its own card, natural height. */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600}>{t('auth.passkeys.title')}</Text>
              <Tooltip label={t('auth.passkeys.unsupported')} disabled={canPasskey}>
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  disabled={!canPasskey}
                  loading={registerPasskey.isPending}
                  onClick={addPasskey}
                >
                  {t('auth.passkeys.add')}
                </Button>
              </Tooltip>
            </Group>

            {passkeys && passkeys.length > 0 ? (
              <Stack gap="xs">
                {passkeys.map((pk) => (
                  <Group key={pk.uuid} justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <ThemeIcon variant="light" color="brand" radius="md">
                        <IconFingerprint size={18} />
                      </ThemeIcon>
                      <div>
                        <Group gap="xs">
                          <Text fw={500}>{pk.name ?? t('auth.passkeys.unnamed')}</Text>
                          {pk.backedUp && (
                            <Badge size="sm" variant="light" color="teal">
                              {t('auth.passkeys.backedUp')}
                            </Badge>
                          )}
                        </Group>
                        <Text size="xs" c="dimmed">
                          {t('auth.passkeys.created', { date: formatDate(pk.createdAt) })}
                          {' · '}
                          {pk.lastUsedAt
                            ? t('auth.passkeys.lastUsed', { date: formatDate(pk.lastUsedAt) })
                            : t('auth.passkeys.neverUsed')}
                        </Text>
                      </div>
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => removePasskey(pk)}
                      loading={deletePasskey.isPending}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Text c="dimmed" size="sm">
                {t('auth.passkeys.empty')}
              </Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
