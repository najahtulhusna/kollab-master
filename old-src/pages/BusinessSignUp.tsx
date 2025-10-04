import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack,
  Stepper,
  Group,
  Text,
  Center,
  Box,
  Title,
  Tabs,
  Image,
} from "@mantine/core";
import TextField from "../components/TextField";
import { css } from "@emotion/css";
import {
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  AlternateEmail,
  PersonOutlined,
  BusinessCenterOutlined,
  DomainOutlined,
  MailOutline,
  StarOutline,
} from "@mui/icons-material";
import { Button } from "../components/Button";
import { useMediaQuery } from "@mantine/hooks";
import { red } from "@mui/material/colors";

interface BusinessSignUpProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  repeatPassword: string;
  setRepeatPassword: (val: string) => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  jobPosition: string;
  setJobPosition: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  showRepeatPassword: boolean;
  setShowRepeatPassword: (val: boolean) => void;
  errors: Record<string, string>;
  onSubmit: () => void;
}

export default function BusinessSignUp() {
  // Local states (always start with "")
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [active, setActive] = useState(0);
  const [value, setValue] = useState<string>("signup1");

  const nextStep = () => setActive((current) => Math.min(current + 1, 2));
  const prevStep = () => setActive((current) => Math.max(current - 1, 0));

  const handleSubmit = () => {
    console.log({
      firstName,
      lastName,
      email,
      username,
      password,
      repeatPassword,
      companyName,
      jobPosition,
    });
  };

  // CSS Loader

  const loader = css`
    width: 40px;
    height: 20px;
    --c: no-repeat radial-gradient(farthest-side, #000 93%, #0000);
    background: var(--c) 0 0, var(--c) 50% 0;
    background-size: 8px 8px;
    position: relative;
    clip-path: inset(-200% -100% 0 0);
    animation: l6-0 1.5s linear infinite;

    &:before {
      content: "";
      position: absolute;
      width: 8px;
      height: 12px;
      background: #000;
      left: -16px;
      top: 0;
      animation: l6-1 1.5s linear infinite,
        l6-2 0.5s cubic-bezier(0, 200, 0.8, 200) infinite;
    }

    &:after {
      content: "";
      position: absolute;
      inset: 0 0 auto auto;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #000;
      animation: l6-3 1.5s linear infinite;
    }

    @keyframes l6-0 {
      0%,
      30% {
        background-position: 0 0, 50% 0;
      }
      33% {
        background-position: 0 100%, 50% 0;
      }
      41%,
      63% {
        background-position: 0 0, 50% 0;
      }
      66% {
        background-position: 0 0, 50% 100%;
      }
      74%,
      100% {
        background-position: 0 0, 50% 0;
      }
    }

    @keyframes l6-1 {
      90% {
        transform: translateY(0);
      }
      95% {
        transform: translateY(15px);
      }
      100% {
        transform: translateY(15px);
        left: calc(100% - 8px);
      }
    }

    @keyframes l6-2 {
      100% {
        top: -0.1px;
      }
    }

    @keyframes l6-3 {
      0%,
      80%,
      100% {
        transform: translate(0);
      }
      90% {
        transform: translate(26px);
      }
    }
  `;

  const navigate = useNavigate();

  useEffect(() => {
    if (active === 2) {
      const timer = setTimeout(() => {
        navigate("/businessdashboard"); // redirect
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [active, navigate]);

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
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Stack
          gap="md"
          style={{ width: isMobile ? "100%" : 360, maxWidth: 400 }}
        >
          {active === 0 && (
            <Box>
              <Title
                order={2}
                ta="left"
                style={{ fontSize: isMobile ? 28 : 24 }}
              >
                Create An Account
              </Title>
              <Text size="sm" ta="left" c="#1f1f1f" mb="lg">
                Create your Business account today and start collaborating with
                Kollab.
              </Text>
            </Box>
          )}

          <Box
            style={{
              height: 600,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Stepper
              color="#1f1f1f"
              active={active}
              onStepClick={setActive}
              breakpoint="sm"
            >
              {/* Step 1: Personal Information */}
              <Stepper.Step>
                <Stack gap="md">
                  <TextField
                    label="First Name"
                    withAsterisk
                    leftSection={<PersonOutlined style={{ fontSize: 18 }} />}
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={errors.firstName}
                  />
                  <TextField
                    label="Last Name"
                    withAsterisk
                    leftSection={<PersonOutlined style={{ fontSize: 18 }} />}
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={errors.lastName}
                  />
                  <TextField
                    label="Email"
                    withAsterisk
                    leftSection={<MailOutline style={{ fontSize: 18 }} />}
                    placeholder="youremail@mail.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                  />
                  <TextField
                    label="Username"
                    withAsterisk
                    leftSection={<AlternateEmail fontSize="small" />}
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={errors.username}
                  />
                  <TextField
                    label="Password"
                    withAsterisk
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
                  <TextField
                    label="Repeat Password"
                    withAsterisk
                    placeholder="Repeat Password"
                    type={showRepeatPassword ? "text" : "password"}
                    leftSection={<LockOutlined style={{ fontSize: 18 }} />}
                    rightSection={
                      showRepeatPassword ? (
                        <VisibilityOutlined
                          style={{ fontSize: 18, cursor: "pointer" }}
                          onClick={() => setShowRepeatPassword(false)}
                        />
                      ) : (
                        <VisibilityOffOutlined
                          style={{ fontSize: 18, cursor: "pointer" }}
                          onClick={() => setShowRepeatPassword(true)}
                        />
                      )
                    }
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    error={errors.repeatPassword}
                  />
                </Stack>
              </Stepper.Step>

              {/* Step 2: Company */}
              <Stepper.Step>
                {active === 1 && (
                  <Stack gap="md">
                    <div style={{ textAlign: "left" }}>
                      <h3 style={{ marginBottom: "0px" }}>
                        Hello {firstName} {lastName}!
                      </h3>
                      <p
                        style={{
                          marginTop: "0px",
                          color: "#A5A5A5",
                          fontSize: "14px",
                        }}
                      >
                        Tell us a bit about your company so we can tailor your
                        experience and help you manage your team effectively.
                      </p>
                    </div>

                    <TextField
                      label="Company Name"
                      withAsterisk
                      leftSection={<DomainOutlined fontSize="small" />}
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      error={errors.companyName}
                    />
                    <TextField
                      label="Job Position"
                      withAsterisk
                      leftSection={<BusinessCenterOutlined fontSize="small" />}
                      placeholder="Job Position"
                      value={jobPosition}
                      onChange={(e) => setJobPosition(e.target.value)}
                      error={errors.jobPosition}
                    />
                  </Stack>
                )}
              </Stepper.Step>

              {/* Step 3: Success */}
              {/* Step 3: Success (Loader + Redirect) */}
              <Stepper.Step>
                {active === 2 && (
                  <Center style={{ flexDirection: "column", gap: "1rem" }}>
                    <Text size="lg" fw={600}>
                      🎉 Sign Up Successful!
                    </Text>
                    <div className={loader}></div>
                    <Text size="sm" c="dimmed">
                      Redirecting to your dashboard...
                    </Text>
                  </Center>
                )}
              </Stepper.Step>
            </Stepper>

            {/* Navigation buttons */}
            <Group position="apart" justify="space-between" mt="md">
              <Button
                variantType="secondary"
                onClick={() => {
                  if (active === 0) {
                    navigate("/signup1"); // go back to SignUp.tsx
                  } else {
                    prevStep(); // go to previous step
                  }
                }}
              >
                Back
              </Button>
              {active < 2 ? (
                <Button variant="primary" onClick={nextStep}>
                  {active === 1 ? "Sign Up" : "Next"}
                </Button>
              ) : null}
            </Group>
          </Box>
        </Stack>
      </Stack>
    </>
  );
}
