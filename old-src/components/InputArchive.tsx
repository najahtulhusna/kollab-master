import { TextInput } from "@mantine/core";
import { Person } from "@mui/icons-material";

export default function Demo() {
  return (
    <TextInput
      label="Username"
      placeholder="Enter username"
      leftSection={<Person fontSize="small" />}
    />
  );
}
