import {
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  PasswordInput,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBrandTelegram, IconSend } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiErrorMessage } from '@/api/client';
import { useSettings, useTestTelegram, useUpdateSettings } from '@/api/settings';
import { notifyError, notifySuccess } from '@/utils/notify';

export function TelegramSettingsCard() {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const testTelegram = useTestTelegram();

  const tgForm = useForm({
    initialValues: {
      notificationsEnabled: false,
      telegramBotToken: '',
      telegramChatId: '',
      telegramTopicId: '',
      upcomingBillingDays: 3,
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-seed the form only when settings load
  useEffect(() => {
    if (!settings) return;
    // Token is write-only. Never prefilled; the rest are.
    tgForm.setValues({
      notificationsEnabled: settings.notificationsEnabled,
      telegramBotToken: '',
      telegramChatId: settings.telegramChatId ?? '',
      telegramTopicId: settings.telegramTopicId ?? '',
      upcomingBillingDays: settings.upcomingBillingDays,
    });
  }, [settings]);

  const saveTelegram = tgForm.onSubmit(async (v) => {
    try {
      await updateSettings.mutateAsync({
        notificationsEnabled: v.notificationsEnabled,
        telegramBotToken: v.telegramBotToken || undefined, // empty = keep existing
        telegramChatId: v.telegramChatId,
        telegramTopicId: v.telegramTopicId,
        upcomingBillingDays: v.upcomingBillingDays,
      });
      tgForm.setFieldValue('telegramBotToken', '');
      notifySuccess(t('settings.telegram.saved'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  });

  const doTestTelegram = async () => {
    try {
      const res = await testTelegram.mutateAsync();
      if (res.sent) notifySuccess(t('settings.telegram.samplesSent', { count: res.sent }));
      else if (!res.enabled) notifyError(t('settings.telegram.notConfiguredError'));
      else notifyError(t('settings.telegram.sendFailed'));
    } catch (e) {
      notifyError(apiErrorMessage(e));
    }
  };

  return (
    <Card withBorder radius="md" padding="lg">
      <Group gap="xs" mb="md">
        <IconBrandTelegram size={20} />
        <Text fw={600}>{t('settings.telegram.title')}</Text>
        {settings?.telegramConfigured ? (
          <Badge color="teal" variant="light">
            {t('settings.telegram.tokenSet')}
          </Badge>
        ) : (
          <Badge color="gray" variant="default">
            {t('settings.telegram.notConfigured')}
          </Badge>
        )}
      </Group>
      <form onSubmit={saveTelegram}>
        <Stack>
          <Switch
            label={t('settings.telegram.enabled')}
            description={t('settings.telegram.enabledDescription')}
            checked={tgForm.values.notificationsEnabled}
            onChange={(e) => tgForm.setFieldValue('notificationsEnabled', e.currentTarget.checked)}
          />
          <PasswordInput
            label={t('settings.telegram.botToken')}
            description={t('settings.telegram.botTokenDescription')}
            placeholder={
              settings?.telegramConfigured
                ? t('settings.telegram.botTokenPlaceholderSet')
                : t('settings.telegram.botTokenPlaceholderNew')
            }
            {...tgForm.getInputProps('telegramBotToken')}
          />
          <TextInput
            label={t('settings.telegram.chatId')}
            description={t('settings.telegram.chatIdDescription')}
            placeholder={t('settings.telegram.chatIdPlaceholder')}
            {...tgForm.getInputProps('telegramChatId')}
          />
          <TextInput
            label={t('settings.telegram.topicId')}
            description={t('settings.telegram.topicIdDescription')}
            {...tgForm.getInputProps('telegramTopicId')}
          />
          <NumberInput
            label={t('settings.telegram.upcomingBillingDays')}
            min={1}
            max={60}
            {...tgForm.getInputProps('upcomingBillingDays')}
          />
          <Group justify="space-between">
            <Button
              variant="default"
              leftSection={<IconSend size={16} />}
              loading={testTelegram.isPending}
              onClick={doTestTelegram}
            >
              {t('settings.telegram.sendSamples')}
            </Button>
            <Button type="submit" loading={updateSettings.isPending}>
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
