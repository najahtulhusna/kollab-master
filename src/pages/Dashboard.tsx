import {
  Box,
  AppShell,
  Navbar,
  Header,
  Text,
  Button,
  Group,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar width={{ base: 200 }} padding="xs">
          <Text mb="sm" weight={700}>
            Menu
          </Text>
          <Button
            fullWidth
            variant="subtle"
            mb="xs"
            onClick={() => navigate("/")}
          >
            Logout
          </Button>
          {/* Add more nav items here */}
        </Navbar>
      }
      header={
        <Header height={60} padding="xs">
          <Group position="apart" align="center" style={{ height: "100%" }}>
            <Text weight={700}>Dashboard</Text>
            <Text size="sm">Welcome, User!</Text>
          </Group>
        </Header>
      }
      styles={(theme) => ({
        main: { backgroundColor: theme.colors.gray[0] },
      })}
    >
      <Box>
        <Text size="xl" weight={700} mb="md">
          Dashboard Content
        </Text>
        <Text>Here you can add your charts, tables, and stats.</Text>
      </Box>
    </AppShell>
  );
}
