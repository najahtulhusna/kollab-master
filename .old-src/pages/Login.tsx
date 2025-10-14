import {
  Stack,
  Title,
  Text,
  Box,
  Loader,
  Center,
  Image,
  Modal,
  Group,
  Tabs,
} from "@mantine/core";
import { Button } from "../components/Button";
import TextField from "../components/TextField";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { notifications } from "@mantine/notifications";
import { useMediaQuery } from "@mantine/hooks";
import { sendPasswordResetEmail } from "firebase/auth";
import {
  PersonOutlined,
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
} from "@mui/icons-material";

function Login() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [value, setValue] = useState<string | null>("1");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [forgotModalOpened, setForgotModalOpened] = useState(false);
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({});
  const setControlRef = (val: string) => (node: HTMLButtonElement) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const snapshot = await getDocs(usernameQuery);

      if (snapshot.empty) {
        notifications.show({
          title: "Login Failed",
          message: "Username not found.",
          color: "red",
        });
        setLoading(false);
        return;
      }

      const userDoc = snapshot.docs[0].data();
      const userUid = snapshot.docs[0].id;
      const userEmail = userDoc.email;

      await signInWithEmailAndPassword(auth, userEmail, password);

      localStorage.setItem(
        "user",
        JSON.stringify({ ...userDoc, uid: userUid })
      );

      notifications.show({
        title: "Login Successful",
        message: `Welcome back, ${userDoc.firstName || "User"}!`,
        color: "green",
      });

      if (userDoc.isAdmin) {
        navigate("/admin-dashboard"); // Or your internal admin route
      } else {
        navigate("/dashboard"); // Normal user dashboard
      }
    } catch (error: any) {
      let message = "Login failed.";
      if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      }

      notifications.show({
        title: "Login Error",
        message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Inline components for each tab

  const BusinessLogin = () => (
    <Stack gap="md">
      <TextField
        label="Business Username"
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
        <Text
          size="xs"
          fw={600}
          c="dark"
          style={{
            cursor: "pointer",
            marginTop: 4,
            display: "block",
            textAlign: "right",
          }}
          onClick={() => setForgotModalOpened(true)}
        >
          Forgot password?
        </Text>
      </Box>
    </Stack>
  );

  const InfluencerLogin = () => (
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
        <Text
          size="xs"
          fw={600}
          c="dark"
          style={{
            cursor: "pointer",
            marginTop: 4,
            display: "block",
            textAlign: "right",
          }}
          onClick={() => setForgotModalOpened(true)}
        >
          Forgot password?
        </Text>
      </Box>
    </Stack>
  );

  return (
    <>
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

        <Tabs variant="none" value={value} onChange={setValue}>
          <Tabs.List ref={setRootRef} className="tabList">
            <Tabs.Tab value="1" ref={setControlRef("1")} className="tabClass">
              Business
            </Tabs.Tab>
            <Tabs.Tab value="2" ref={setControlRef("2")} className="tabClass">
              Influencer
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Group>

      {/* Main Container */}
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "85vh",
          padding: isMobile ? "24px" : 0,
        }}
      >
        {loading ? (
          <Center>
            <Loader size="lg" color="violet" type="dots" />
          </Center>
        ) : (
          <Box style={{ width: isMobile ? "100%" : 360, maxWidth: 400 }}>
            <Title
              order={2}
              ta="center"
              style={{ fontSize: isMobile ? 28 : 24 }}
            >
              Welcome back to Kollab
            </Title>
            <Text size="sm" ta="center" c="#1f1f1f" mb="lg">
              Please sign in to continue managing your influencer campaigns and
              performance.
            </Text>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              {value === "1" ? <BusinessLogin /> : <InfluencerLogin />}

              <Modal
                opened={forgotModalOpened}
                onClose={() => setForgotModalOpened(false)}
                title={<strong>Reset Your Password</strong>}
                centered
                size="sm"
              >
                <Text size="sm" mb="sm">
                  Enter your email address below. We'll send you a password
                  reset link.
                </Text>

                <TextField
                  label="Email"
                  placeholder="youremail@mail.com"
                  type="email"
                  value={resetEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setResetEmail(e.currentTarget.value)
                  }
                  required
                />

                <Button
                  fullWidth
                  mt="md"
                  onClick={async () => {
                    if (!resetEmail) {
                      notifications.show({
                        title: "Error",
                        message: "Please enter your email address.",
                        color: "red",
                      });
                      return;
                    }

                    try {
                      await sendPasswordResetEmail(auth, resetEmail);
                      notifications.show({
                        title: "Reset Link Sent",
                        message:
                          "Please check your inbox for the password reset email.",
                        color: "green",
                      });
                      setForgotModalOpened(false);
                      setResetEmail("");
                    } catch (error: any) {
                      console.error("Reset error", error);
                      notifications.show({
                        title: "Failed to Send",
                        message:
                          error.code === "auth/user-not-found"
                            ? "No user found with this email."
                            : "Something went wrong. Please try again.",
                        color: "red",
                      });
                    }
                  }}
                >
                  Send Reset link
                </Button>
              </Modal>

              <Group
                gap="xl"
                mt="md"
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <Button size={isMobile ? "lg" : "md"} type="submit" fullWidth>
                  Login
                </Button>

                <Button
                  size={isMobile ? "lg" : "md"}
                  variantType="secondary"
                  fullWidth
                  onClick={() => navigate("/signup")}
                >
                  Don’t have an account? Sign Up
                </Button>
              </Group>
            </form>
          </Box>
        )}
      </Box>
    </>
  );
}

export default Login;
