import { Center, Grid, Loader, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { AuthMethodsCard, type MethodsFormValues } from './AuthMethodsCard';
import { PasskeysCard } from './PasskeysCard';

export function AuthSettingsPage() {
  const { t } = useTranslation();
  const { data: config } = useAuthConfig();
  const { data: passkeys } = usePasskeys();
  const updateConfig = useUpdateAuthConfig();
  const registerPasskey = useRegisterPasskey();
  const deletePasskey = useDeletePasskey();

  const canPasskey = passkeySupported();
  const [pkOpen, pkDisc] = useDisclosure(false);

  const methodsForm = useForm<MethodsFormValues>({
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

  // Wait for the real config before rendering toggles. Avoids a flash of the default
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
        <Grid.Col span={{ base: 12, md: 7 }}>
          <AuthMethodsCard
            form={methodsForm}
            pkOpen={pkOpen}
            onTogglePk={pkDisc.toggle}
            onUseCurrentHost={useCurrentHost}
            onSave={saveMethods}
            saving={updateConfig.isPending}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <PasskeysCard
            passkeys={passkeys}
            canPasskey={canPasskey}
            adding={registerPasskey.isPending}
            removing={deletePasskey.isPending}
            onAdd={addPasskey}
            onRemove={removePasskey}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
