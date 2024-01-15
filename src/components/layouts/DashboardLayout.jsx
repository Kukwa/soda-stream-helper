import { NavLink, Outlet } from "react-router-dom";
import { AppShell, Burger, Grid, ScrollArea, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebaseConfig.js";

export function DashboardLayout() {
  const [isNavbarOpen, { toggle: toggleNavbar }] = useDisclosure();
  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <AppShell
      header={{ height: 120 }}
      navbar={{
        width: "150",
        breakpoint: "sm",
        collapsed: { mobile: !isNavbarOpen },
      }}
      bg={"#ffffff"}
      padding="md"
    >
      <AppShell.Header>
        <Grid p={30}>
          <Burger
            opened={isNavbarOpen}
            onClick={toggleNavbar}
            hiddenFrom="sm"
            size="sm"
          />
          <h1>Soda Stream Helper</h1>
        </Grid>
      </AppShell.Header>
      <AppShell.Navbar>
        <Stack style={{ margin: 20 }} justify="flex-end">
          <NavLink
            className={"nav-link"}
            onClick={toggleNavbar}
            to={"/dashboard"}
            end
          >
            HOME
          </NavLink>
          <NavLink className={"nav-link"} onClick={toggleNavbar} to={"items"}>
            ITEMS
          </NavLink>
          <NavLink className={"nav-link"} onClick={toggleNavbar} to={"profile"}>
            PROFILE
          </NavLink>
          <NavLink className={"nav-link"} onClick={handleSignOut} to={"/login"}>
            Sign out
          </NavLink>
        </Stack>
      </AppShell.Navbar>
      <ScrollArea>
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </ScrollArea>
    </AppShell>
  );
}
