import { ActionIcon, AspectRatio, Center } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

// Button to add new item in dashboard
export function AddItemButton(props) {
  return (
    <Center>
      <AspectRatio ratio={1} w={"30%"}>
        <ActionIcon onClick={props.onClick}>
          <IconPlus />
        </ActionIcon>
      </AspectRatio>
    </Center>
  );
}
