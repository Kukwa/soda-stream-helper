import { useContext, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { firestore, storage } from "../../../firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  getAggregateFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  sum,
  where,
} from "firebase/firestore";
import { Context } from "./../../context/AuthContext";
import {
  Button,
  Center,
  Grid,
  Image,
  Loader,
  NativeSelect,
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { getDownloadURL, ref } from "firebase/storage";
import { BarChart, DonutChart } from "@mantine/charts";

export function ItemmDetailsPage() {
  const { id: itemId } = useParams();
  const [item, setItem] = useState(null);
  const { user, householdId } = useContext(Context);

  const [isItemLoading, setIsItemLoading] = useState(true);
  const [isItemHistoryLoading, setIsItemHistoryLoading] = useState(true);
  const [isDeclareUsageLoading, setIsDeclareUsageLoading] = useState(true);
  const [itemList, setItemList] = useState([]);

  const [declareBottleId, setDeclareBottleId] = useState("");
  const [declareSyrupId, setDeclareSyrupId] = useState("");
  const [declareCylinderId, setDeclareCylinderId] = useState("");

  const [historyChartData, setHistoryChartData] = useState(null);
  const [chartLabels, setChartLabels] = useState(null);
  const [usagePerUserChartData, setUsagePerUserChartData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    handleItemLoad();
  }, []);

  useEffect(() => {
    handleDeclareUsage();
  }, [item]);

  useEffect(() => {
    handleGetHistory();
  }, [itemList]);

  useEffect(() => {}, [historyData, usagePerUserChartData]);

  const handleItemLoad = async () => {
    const path = `households/${householdId}/items/${itemId}`;
    console.log(path);
    const item = (await getDoc(doc(firestore, path))).data();
    item.id = itemId;
    item.image = await getDownloadURL(ref(storage, path));
    switch (item.category) {
      case "bottle":
        setDeclareBottleId(item.id);
        break;
      case "syrup":
        setDeclareSyrupId(item.id);
        break;
      case "cylinder":
        setDeclareCylinderId(item.id);
        break;
    }

    setItem(item);
    setIsItemLoading(false);
  };

  const handleGetHistory = async () => {
    if (!item && itemList.length == 0) {
      setIsItemHistoryLoading(true);
      return;
    }
    const historyPath = `households/${householdId}/history`;
    const usersPath = `users`;
    const historyQuery = query(
      collection(firestore, historyPath),
      where(`${item.category}Id`, "==", item.id),
      orderBy("timestamp", "desc")
    );
    const docsRef = await getDocs(historyQuery);
    const historyData = docsRef.docs.map((docRef) => {
      const item = docRef.data();
      item.id = docRef.id;
      return item;
    });

    const usersQuery = query(
      collection(firestore, usersPath),
      where(`householdId`, "==", householdId)
    );
    const usersRef = await getDocs(usersQuery);
    const usersList = usersRef.docs.map((docRef) => {
      const data = docRef.data();
      data.id = docRef.id;
      return data;
    });

    setUsers(usersList);
    setHistoryData(historyData);
    setIsItemHistoryLoading(false);

    const mainChartData = [];

    const today = new Date();
    // (7*24*60*60*1000)
    let currentDate = new Date(today);
    let historyIndex = 0;
    let currentData = { date: currentDate.toDateString() };
    const chartLabels = [{ name: "Water", color: "indigo.6" }];
    console.log(itemList);
    while (mainChartData.length < 7 && historyIndex < historyData.length - 1) {
      if (
        currentDate.toDateString() ==
        historyData[historyIndex].timestamp.toDate().toDateString()
      ) {
        const key =
          historyData[historyIndex].syrupId == ""
            ? "Water"
            : itemList.find((item) => {
                console.log(item.id, historyData[historyIndex].syrupId);
                return item.id == historyData[historyIndex].syrupId;
              }).name;
        console.log(key);

        if (chartLabels.find((label) => label.name == key) == undefined) {
          const color = itemList.find(
            (item) => item.id == historyData[historyIndex].syrupId
          ).color;
          chartLabels.push({ name: key, color: color });
        }

        currentData[key] =
          currentData[key] == null
            ? historyData[historyIndex].capacity
            : Number(currentData[key]) +
              Number(historyData[historyIndex].capacity);
        historyIndex++;
      } else {
        currentDate = new Date(currentDate - 24 * 60 * 60 * 1000);
        mainChartData.push(currentData);
        currentData = { date: currentDate.toDateString() };
      }
    }

    const perUserChartData = [];

    for (const userData of usersList) {
      const perUserChartQuery = query(
        collection(firestore, `households/${householdId}/history`),
        where("userId", "==", userData.id),
        where(`${item.category}Id`,"==",itemId)
      );
      const snapshot = await getAggregateFromServer(perUserChartQuery, {
        total: sum("capacity"),
      });
      perUserChartData.push({
        name: userData.displayName,
        value: snapshot.data().total,
        color: userData.color,
      });
    }

    // const total = perUserChartData.reduce((accumulator,currentvalue) => {accumulator+currentvalue.total},0)

    setUsagePerUserChartData(perUserChartData);
    setChartLabels(chartLabels);
    setHistoryChartData(mainChartData.reverse());
  };

  const handleDeclareUsage = async () => {
    if (!item) {
      setIsDeclareUsageLoading(true);
      return;
    }
    const path = `households/${householdId}/items`;
    const itemsQuery = query(collection(firestore, path));
    const docsRef = await getDocs(itemsQuery);
    const itemList = docsRef.docs.map((docRef) => {
      const item = docRef.data();
      item.id = docRef.id;
      return item;
    });
    setItemList(itemList);
    setIsDeclareUsageLoading(false);
  };

  const renderHistory = () => {
    if (isItemHistoryLoading)
      return (
        <Center>
          <Loader></Loader>
        </Center>
      );

    return (
      <Stack>
        <Text>List of last usages</Text>
        <Text>{`Number of entries : ${historyData.length}`}</Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Capacity</Table.Th>
              <Table.Th>User</Table.Th>
              <Table.Th>Bottle</Table.Th>
              <Table.Th>Syrup</Table.Th>
              <Table.Th>Cylinder</Table.Th>
              <Table.Th>Date</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {historyData.map((data) => {
              return (
                <Table.Tr key={data.id}>
                  <Table.Td>{`${data.capacity}ml`}</Table.Td>
                  <Table.Td>
                    {
                      users.find((value) => {
                        return value.id == data.userId;
                      }).displayName
                    }
                  </Table.Td>
                  <Table.Td>
                    {data.bottleId == ""
                      ? "None"
                      : itemList.find((item) => {
                          return item.id == data.bottleId;
                        }).name}
                  </Table.Td>
                  <Table.Td>
                    {data.syrupId == ""
                      ? "None"
                      : itemList.find((item) => {
                          return item.id == data.syrupId;
                        }).name}
                  </Table.Td>
                  <Table.Td>
                    {data.cylinderId == ""
                      ? "None"
                      : itemList.find((item) => {
                          return item.id == data.cylinderId;
                        }).name}
                  </Table.Td>
                  <Table.Td>{`${data.timestamp.toDate().getDate()}.${
                    data.timestamp.toDate().getMonth() + 1
                  }.${data.timestamp.toDate().getFullYear()}`}</Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Stack>
    );
  };

  const renderMainChart = () => {
    if (!historyChartData)
      return (
        <Center h={"100%"}>
          <Loader></Loader>
        </Center>
      );

    return (
      <BarChart
        unit="ml"
        h="100%"
        data={historyChartData}
        dataKey="date"
        series={chartLabels}
        curveType="linear"
      />
    );
  };
  const renderPerUserChart = () => {
    if (!usagePerUserChartData)
      return (
        <Center h={"100%"}>
          <Loader></Loader>
        </Center>
      );

    console.log(usagePerUserChartData);
    const total = usagePerUserChartData.reduce(
      (sum, current) => sum + current.value,
      0
    );
    return (
      <Stack>
        <DonutChart data={usagePerUserChartData} mx="auto" />
        <Center>
          <Text>{`Total : ${total}ml`}</Text>
        </Center>
      </Stack>
    );
    // return <Text>XD</Text>;
  };

  const renderDeclareUsageForm = () => {
    if (isDeclareUsageLoading)
      return (
        <Center h={"100%"}>
          <Loader></Loader>
        </Center>
      );

    return (
      <Center>
        <Stack w={"100%"} h={"100%"}>
          <Text>Declare usage</Text>
          {item.category !== "bottle" && (
            <NativeSelect
              value={declareBottleId}
              label="Choose bottle"
              data={[{ label: "No bottle selected", value: "" }].concat(
                itemList
                  .filter((item) => {
                    return item.category === "bottle";
                  })
                  .map((item) => {
                    return { label: item.name, value: item.id };
                  })
              )}
              onChange={(event) => {
                setDeclareBottleId(event.currentTarget.value);
              }}
            />
          )}
          {item.category !== "syrup" && (
            <NativeSelect
              value={declareSyrupId}
              label="Choose syrup"
              data={[{ label: "No syrup selected", value: "" }].concat(
                itemList
                  .filter((item) => {
                    return item.category === "syrup";
                  })
                  .map((item) => {
                    return { label: item.name, value: item.id };
                  })
              )}
              onChange={(event) => {
                setDeclareSyrupId(event.currentTarget.value);
              }}
            />
          )}
          {item.category !== "cylinder" && (
            <NativeSelect
              value={declareCylinderId}
              label="Choose gas cylinder"
              data={[{ label: "No cylinder selected", value: "" }].concat(
                itemList
                  .filter((item) => {
                    return item.category === "cylinder";
                  })
                  .map((item) => {
                    return { label: item.name, value: item.id };
                  })
              )}
              onChange={(event) => {
                setDeclareCylinderId(event.currentTarget.value);
              }}
            />
          )}
          <Button
            onClick={async () => {
              const path = `households/${householdId}/history`;
              if (declareBottleId === "" || declareCylinderId === "") return;
              const doc = await addDoc(collection(firestore, path), {
                bottleId: declareBottleId,
                syrupId: declareSyrupId,
                cylinderId: declareCylinderId,
                timestamp: serverTimestamp(),
                userId: user.uid,
                capacity: itemList.find((item) => {
                  return item.id == declareBottleId;
                }).capacity,
              });
            }}
          >
            Confirm
          </Button>
        </Stack>
      </Center>
    );
  };

  if (isItemLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );

  return (
    <>
      <NavLink to={"../items"}>{"Go back"}</NavLink>
      <Grid justify="flex-start" align="stretch">
        {/* Info Column */}
        <Grid.Col span={{ sm: 12, lg: 3 }}>
          <Paper withBorder shadow="xl" p="xl">
            <Center>
              <Text size="xl">{item.name}</Text>
            </Center>
            <Center>
              <Image
                h="40vh"
                w="30vh"
                fit="cover"
                radius="xs"
                src={item.image}
              />
            </Center>
            <Center>
              <Text size="xl">{`${item.capacity}ml`}</Text>
            </Center>
          </Paper>
        </Grid.Col>

        {/* Usage data Chart */}
        <Grid.Col span={{ sm: 12, md: 9 }}>{renderMainChart()}</Grid.Col>

        <Grid.Col span={{ sm: 12, md: 4 }}>
          <Paper withBorder shadow="xl" p="xl" h="100%">
            {renderDeclareUsageForm()}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ sm: 12, md: 4 }}>
          <Paper withBorder shadow="xl" p="xl" h="100%">
            {renderPerUserChart()}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ sm: 12, md: 4 }}>
          <Paper withBorder shadow="xl" p="xl" h="100%">
            Usage per user
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ sm: 12, md: 12 }}>
          <Paper withBorder shadow="xl" p="xl" h="100%">
            {renderHistory()}
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}
