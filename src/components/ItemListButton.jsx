import {AspectRatio, Center, Image, Paper, Text, UnstyledButton} from "@mantine/core";

// Button with image and name of an item on the dashboard
export function ItemListButton(props) {

    // Function to handle onClick
    const handleClick = () => {
        alert(`clicked ${props.name}`)
    }

    return (
        <Center mb={30}>
            <AspectRatio ratio={1} w="50%">
                <UnstyledButton style={{borderStyle: "solid", border: "#000000", borderWidth: "1px"}}
                                onClick={handleClick}>
                    <Paper
                        withBorder
                        shadow="xl" p="xl"
                    >
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
    )
}