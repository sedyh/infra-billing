import {
  ActionIcon,
  Collapse,
  Group,
  Switch,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { IconChevronDown, type Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';

// A sign-in method row. Rows with config (passkey) get an expand chevron + collapsible body;
// plain on/off rows (password) are just the switch.
export function MethodRow({
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
        {/* When expandable, the whole label toggles the section; only the switch is exempt. */}
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
