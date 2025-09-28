import { Stack, Box, Text } from "@mantine/core";
import TextField from "../components/TextField";
import {
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  PersonOutlined,
} from "@mui/icons-material";

interface InfluencerSignUpProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  errors: Record<string, string>;
}

export default function InfluencerSignUp({
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  errors,
}: InfluencerSignUpProps) {
  return (
    <Stack gap="md">
      <TextField
        label="Influencer Username"
        withAsterisk
        placeholder="Username"
        leftSection={<PersonOutlined fontSize="small" />}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errors.username}
      />
      <Box>
        <TextField
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          leftSection={<LockOutlined style={{ fontSize: 18 }} />}
          rightSection={
            showPassword ? (
              <VisibilityOutlined
                style={{ fontSize: 18, cursor: "pointer" }}
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <VisibilityOffOutlined
                style={{ fontSize: 18, cursor: "pointer" }}
                onClick={() => setShowPassword(true)}
              />
            )
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
      </Box>
    </Stack>
  );
}
