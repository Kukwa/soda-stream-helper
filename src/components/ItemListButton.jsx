import {
  AspectRatio,
  Center,
  Image,
  Paper,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { NavLink } from "react-router-dom";

// Button with image and name of an item on the dashboard
export function ItemListButton(props) {
  return (
    <NavLink to={`${props.id}`}>
    <Center mb={30}>
      <AspectRatio ratio={1} w="50%">
        <UnstyledButton
          style={{
            borderStyle: "solid",
            border: "#000000",
            borderWidth: "1px",
          }}
        >
          <Paper withBorder shadow="xl" p="xl">
            <Center>
              <Image
                h="7vw"
                w="auto"
                fit="contain"
                radius="xs"
                src={props.image}
              />
            </Center>
            <Center>
              <Text>{props.name}</Text>
            </Center>
          </Paper>
        </UnstyledButton>
      </AspectRatio>
    </Center>
    </NavLink>
  );
}
