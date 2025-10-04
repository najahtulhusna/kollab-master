import {
  Box,
  Flex,
  Avatar,
  Menu,
  Text,
  ActionIcon,
  Loader,
  Title,
  Image,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconBell,
  IconLogout,
  IconRefresh,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

export default function TopNavbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("auto");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) {
    return (
      <Box px="md" py="sm">
        <Loader size="sm" />
      </Box>
    );
  }

  return (
    <Box
      bg="#ffffff"
      px="md"
      py="sm"
      style={{ borderBottom: "1px solid #e5e5e5" }}
    >
      <Flex justify="space-between" align="center">
        {/* Company Logo */}
        <Image
          src="src/assets/logo1.png"
          alt="Company Logo"
          w={40}
          h={40}
          radius="sm"
        />

        <Flex align="center" gap="md">
          <ActionIcon variant="subtle" color="black">
            <IconBell />
          </ActionIcon>

          {/* Avatar Menu */}
          <Menu shadow="md" width={220} withArrow position="bottom-end">
            <Menu.Target>
              {user?.photoURL ? (
                <Avatar
                  src={user.photoURL}
                  radius="xl"
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <Avatar
                  color="purple"
                  radius="xl"
                  style={{ cursor: "pointer" }}
                >
                  {profile?.firstName
                    ? profile.firstName.charAt(0).toUpperCase()
                    : "U"}
                </Avatar>
              )}
            </Menu.Target>

            <Menu.Dropdown>
              <Box px="sm" py="xs">
                <Text weight={500}>
                  {profile
                    ? `${profile.firstName} ${profile.lastName}`
                    : "Unnamed User"}
                </Text>
                <Text size="xs" color="dimmed">
                  {user?.email}
                </Text>
              </Box>

              <Menu.Divider />

              <Menu.Label>Appearance</Menu.Label>
              <Menu.Item
                icon={<IconSun size={16} />}
                onClick={() => setColorScheme("light")}
                disabled={computed === "light"}
              >
                Light
              </Menu.Item>
              <Menu.Item
                icon={<IconMoon size={16} />}
                onClick={() => setColorScheme("dark")}
                disabled={computed === "dark"}
              >
                Dark
              </Menu.Item>
              <Menu.Item
                icon={<IconRefresh size={16} />}
                onClick={() => setColorScheme("auto")}
                disabled={computed === "auto"}
              >
                System
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                icon={<IconLogout size={16} />}
                color="red"
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
}
