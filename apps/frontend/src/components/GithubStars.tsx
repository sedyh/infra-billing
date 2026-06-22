import { Button, Group, Text } from '@mantine/core';
import { IconBrandGithub, IconStarFilled } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import classes from './GithubStars.module.css';

const REPO = 'mishkatik/infra-billing';
const REPO_URL = `https://github.com/${REPO}`;

export function GithubStars() {
  const { t } = useTranslation();
  const { data: stars } = useQuery({
    queryKey: ['github-stars'],
    queryFn: async () =>
      (await axios.get<{ stargazers_count: number }>(`https://api.github.com/repos/${REPO}`)).data
        .stargazers_count,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  if (stars == null) return null;

  return (
    <Button
      component="a"
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      variant="default"
      radius="xl"
      size="compact-sm"
      classNames={{ root: classes.pill }}
      aria-label={t('app.starOnGithub')}
      leftSection={<IconBrandGithub size={16} />}
    >
      <Group gap={6} wrap="nowrap">
        <IconStarFilled size={13} className={classes.star} />
        <Text fw={600} fz="sm" lh={1}>
          {stars}
        </Text>
      </Group>
    </Button>
  );
}
