import { SimpleGrid, Stack } from "@mantine/core";
import { ItemListButton } from "./ItemListButton.jsx";
import { AddItemButton } from "./AddItemButton.jsx";

// Component containing list of items on the dashboard and AddItemButton
export function ItemListComponent(props) {
  return (
    <Stack>
      <h3>{props.itemHeader}</h3>
      <SimpleGrid cols={{ sm: 2, lg: 4 }} spacing="lg" verticalSpacing="xl">
        {props.items.map((item) => {
          return (
            <ItemListButton key={item.id} id={item.id} image={item.image} name={item.name} />
          );
        })}
        <AddItemButton onClick={props.onAddClick}></AddItemButton>
      </SimpleGrid>
    </Stack>
  );
}
