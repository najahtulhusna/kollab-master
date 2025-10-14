import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Button,
  Grid,
} from "@mantine/core";

export default function BusinessDashboard() {
  return (
    <Container size="lg" py="xl">
      {/* Page Title */}
      <Title order={2} mb="md">
        Business Dashboard
      </Title>
      <Text c="dimmed" mb="xl">
        Welcome back! Here’s a quick overview of your business activity.
      </Text>

      {/* Dashboard Cards */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="sm" c="dimmed">
              Total Campaigns
            </Text>
            <Title order={3}>12</Title>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="sm" c="dimmed">
              Active Ads
            </Text>
            <Title order={3}>5</Title>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="sm" c="dimmed">
              Impressions
            </Text>
            <Title order={3}>24.3k</Title>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="sm" c="dimmed">
              Clicks
            </Text>
            <Title order={3}>1.2k</Title>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Actions */}
      <Group mt="xl">
        <Button variant="filled">Create New Campaign</Button>
        <Button variant="outline">View Reports</Button>
      </Group>
    </Container>
  );
}
