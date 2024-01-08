import React, {useEffect, useState} from "react";
import {ItemListComponent} from "../../components/ItemListComponent.jsx";
import {Space, Modal, TextInput, FileButton, Button, Text, Image, Center, NumberInput} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {firestore, storage} from "../../../firebaseConfig.js";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";
import {doc, setDoc, collection, query, where, onSnapshot} from "firebase/firestore";

const MODAL_TITLES_BY_CATEGORY = {
    "bottle": "Add new bottle",
    "syrup": "Add new syrup",
    "cylinder": "Add new cylinder",
}

const MOCK_HOUSEHOLD_ID = "EwxUhi08NUBPhgkPdh7n"

export function ItemsListPage() {
    const [isModalOpen, modalHandlers] = useDisclosure(false)

    const [bottleList, setBottleList] = useState([])
    const [syrupList, setSyrupList] = useState([])
    const [cylinderList, setCylinderList] = useState([])
    const [newItemCategory, setNewItemCategory] = useState("")
    const [newItemImage, setNewItemImage] = useState(null)
    const [newItemName, setNewItemName] = useState('')
    const [newItemCapacity, setNewItemCapacity] = useState(1000)
    const [isCompleted, setIsCompleted] = useState(false)
    const [isNewItemLoading, setIsNewItemLoading] = useState(false)

    // Function to get items from Firestore by category
    const getItemsByCategory = async (householdId, category, onItemsChange) => {
        const itemsQuery = query(collection(firestore, `households/${householdId}/items`), where("category", "==", category))
        onSnapshot(itemsQuery, async (snapshot) => {
            // Map result to list
            const itemList = snapshot.docs.map(async (doc) => {
                const item = doc.data()
                item.image = await getDownloadURL(ref(storage, doc.ref.path.toString()))
                item.id = doc.id
                return item
            })
            const resolvedItems = await Promise.all(itemList)
            onItemsChange(resolvedItems)
        })
    }

    // Set observers for each category
    useEffect(() => {
        getItemsByCategory(MOCK_HOUSEHOLD_ID, "bottle", setBottleList)
        getItemsByCategory(MOCK_HOUSEHOLD_ID, "syrup", setSyrupList)
        getItemsByCategory(MOCK_HOUSEHOLD_ID, "cylinder", setCylinderList)
    }, []);

    const resetValuesToDefault = () => {
        setNewItemImage(null)
        setNewItemName('')
        setNewItemCapacity(1000)
    }

    const handleNewItemConfirm = async () => {
        setIsNewItemLoading(true)

        const newItemRef = doc(collection(firestore, `households/${MOCK_HOUSEHOLD_ID}/items`));
        try {
            const storageRef = ref(storage, newItemRef.path);
            await uploadBytes(storageRef, newItemImage)
            await setDoc(newItemRef, {
                capacity: newItemCapacity,
                name: newItemName,
                category: newItemCategory
            })
            modalHandlers.close()
            setNewItemImage(null)
            setNewItemName('')
            setNewItemCapacity(1000)
        } catch (e) {
            console.log(e.message)
        } finally {
            setIsNewItemLoading(false)
        }
    }

    // Check if all properties all set
    useEffect(() => {
        const isImage = newItemImage !== null
        const isName = newItemName !== ""
        const isCapacity = newItemCapacity > 0
        setIsCompleted(isImage && isName && isCapacity)
    }, [newItemImage, newItemCapacity, newItemName]);

    // Reset values to default when adding new item
    useEffect(() => {
        resetValuesToDefault()
    }, [newItemCategory]);

    const onBottleItemClick = () => {
        setNewItemCategory("bottle")
        modalHandlers.open()
    }

    const onSyrupItemClick = () => {
        setNewItemCategory("syrup")
        modalHandlers.open()
    }

    const onCylinderItemClick = () => {
        setNewItemCategory("cylinder")
        modalHandlers.open()
    }

    const handleNameChange = (event) => {
        setNewItemName(event.currentTarget.value)
    }

    const handleFileChange = (file) => {
        setNewItemImage(file);
    }
    return (<>

            {/*Modal to add new items*/}
            <Modal opened={isModalOpen} onClose={modalHandlers.close} title={MODAL_TITLES_BY_CATEGORY[newItemCategory]}
                   centered
                   style={{alignItems: "center"}}>
                <TextInput
                    placeholder={"Item name"}
                    label={"Item name"}
                    value={newItemName}
                    onChange={handleNameChange}
                />
                {newItemImage && (<Image
                    radius="xs"
                    src={URL.createObjectURL(newItemImage)}
                />)}
                <Space h="md"/>
                <Center>
                    <FileButton style={{alignContent: "center"}} onChange={handleFileChange}
                                accept="image/png,image/jpeg,image/webp">
                        {(props) => <Button {...props}>Upload image</Button>}
                    </FileButton>
                </Center>
                <Space h="xs"/>
                <NumberInput
                    label="Capacity"
                    suffix=" ml"
                    mt="md"
                    allowNegative={false}
                    allowDecimal={false}
                    onChange={setNewItemCapacity}
                    value={newItemCapacity}
                />
                <Space h="md"/>

                {isCompleted && (
                    <Center>
                        <Button
                            onClick={handleNewItemConfirm}
                            loading={isNewItemLoading}
                        > Add new Item </Button>
                    </Center>
                )}
            </Modal>

            {/*Bottles*/}
            <ItemListComponent items={bottleList} itemHeader={"Your Bottles"} onAddClick={onBottleItemClick}/>
            <Space h="xl"/>
            {/*Syrups*/}
            <ItemListComponent items={syrupList} itemHeader={"Your Syrups"} onAddClick={onSyrupItemClick}/>
            {/*Gas cylinders*/}
            <ItemListComponent items={cylinderList} itemHeader={"Your Gas Cylinders"} onAddClick={onCylinderItemClick}/>
        </>

    );
}
