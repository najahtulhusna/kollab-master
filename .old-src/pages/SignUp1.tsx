import { Stack, Group, Text, Title, Box, Tabs, Image } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { BusinessCenterOutlined, StarOutline } from "@mui/icons-material";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";

export default function SignUp() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [value, setValue] = useState<string>("signup1");

  return (
    <>
      {/* Header */}
      <Group
        justify="space-between"
        align="center"
        w="100%"
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "24px",
          alignContent: "center",
        }}
      >
        <Image src="src/assets/logo-v1.svg" alt="Company Logo" w={40} h={40} />

        <Tabs
          variant="none"
          value={value}
          onChange={(tab) => {
            setValue(tab || "");
            if (tab === "login") navigate("/Login");
            if (tab === "signup") navigate("/SignUp1");
          }}
        >
          <Tabs.List className="tabList">
            <Tabs.Tab value="login" className="tabClass">
              Login
            </Tabs.Tab>
            <Tabs.Tab value="signup1" className="tabClass">
              Sign Up
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Group>

      {/* Page Content */}
      <Stack
        style={{
          width: "100%",
          display: "flex",
          marginTop: "15%",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Stack
          style={{
            width: isMobile ? "100%" : 360,
            maxWidth: 400,
            padding: isMobile ? "24px" : 0,
          }}
        >
          <Box>
            <Title order={2} ta="left" style={{ fontSize: isMobile ? 28 : 24 }}>
              Create An Account
            </Title>
            <Text size="sm" ta="left" c="#1f1f1f" mb="lg">
              Create your Business account today and start collaborating with
              Kollab.
            </Text>
          </Box>

          <Group grow>
            <Stack
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                outline: "2px solid #1f1f1f",
                padding: "16px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
              onClick={() => navigate("/businesssignup")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f2f2f2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <BusinessCenterOutlined style={{ fontSize: 70 }} />
              <Text fw={600}>For Business</Text>
            </Stack>

            <Stack
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                outline: "2px solid #1f1f1f",
                padding: "16px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
              onClick={() => navigate("/influencersignup")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f2f2f2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <StarOutline style={{ fontSize: 70 }} />
              <Text fw={600}>As an Influencer</Text>
            </Stack>
          </Group>
        </Stack>
      </Stack>
    </>
  );
}
