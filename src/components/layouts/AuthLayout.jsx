import { Outlet } from "react-router-dom";
import { Center } from "@mantine/core";

export function AuthLayout() {
  return (
    <Center h={"100vh"}>
      <Outlet />
    </Center>
  );
}
