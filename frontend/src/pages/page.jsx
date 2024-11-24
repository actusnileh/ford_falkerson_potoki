import React, { useState, useCallback } from "react";
import {
    Container,
    Button,
    Modal,
    NumberInput,
    Notification,
    Card,
    Text,
    Divider,
    ActionIcon,
    Transition,
} from "@mantine/core";
import {
    IconPlus,
    IconSend,
    IconClipboardPlus,
    IconExposurePlus1,
} from "@tabler/icons-react";
import ReactFlow, {
    Background,
    Controls,
    useEdgesState,
    useNodesState,
    addEdge,
    MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";

let nodeId = 1;

const exampleMatrix = [
    [0, 5, 0, 1, 0],
    [0, 0, 1, 2, 1],
    [0, 1, 0, 0, 3],
    [0, 0, 4, 0, 3],
    [0, 0, 0, 0, 0],
];

export const HomePage = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [modalOpened, setModalOpened] = useState(false);
    const [edgeWeight, setEdgeWeight] = useState("");
    const [capacityMatrix, setCapacityMatrix] = useState([]);
    const [source, setSource] = useState();
    const [sink, setSink] = useState();
    const [result, setResult] = useState([]);
    const [notification, setNotification] = useState("");

    const trimMatrix = (matrix, size) => {
        return matrix.slice(0, size).map((row) => row.slice(0, size));
    };

    const addNode = () => {
        const newNode = {
            id: `${nodeId}`,
            data: { label: `${nodeId}` },
            position: { x: Math.random() * 100, y: Math.random() * 100 },
            style: {
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: nodeId === 1 ? "#4CAF50" : "#1E90FF",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
            },
        };

        setNodes((nds) => [...nds, newNode]);
        setCapacityMatrix((matrix) => {
            const size = nodes.length + 1;
            const updatedMatrix = Array.from({ length: size }, () =>
                Array(size).fill(0)
            );
            matrix.forEach((row, i) => {
                updatedMatrix[i] = [
                    ...row,
                    ...Array(size - row.length).fill(0),
                ];
            });
            return updatedMatrix;
        });
        nodeId += 1;
    };

    const handleNodeClick = (event, node) => {
        console.log("Clicked node:", node);
        if (selectedNodes.length === 1) {
            setSelectedNodes((prev) => [...prev, node.id]);
            setModalOpened(true);
        } else {
            setSelectedNodes([node.id]);
        }
    };

    const createEdge = useCallback(() => {
        const [source, target] = selectedNodes;

        if (!source || !target || edgeWeight === "") return;

        const newEdge = {
            id: `e${source}-${target}`,
            source,
            target,
            label: edgeWeight,
            animated: true,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#1E90FF",
            },
            style: { strokeWidth: 2, stroke: "#1E90FF" },
            labelStyle: {
                fill: "white",
                fontWeight: 600,
                fontSize: 12,
            },
            labelBgStyle: {
                fill: "#2c2c2c",
                color: "#fff",
            },
            labelBgPadding: [6, 4],
            labelBgBorderRadius: 4,
        };

        setEdges((eds) => addEdge(newEdge, eds));
        setCapacityMatrix((matrix) => {
            const updatedMatrix = [...matrix];
            updatedMatrix[source - 1][target - 1] = Number(edgeWeight);
            return updatedMatrix;
        });
        setSelectedNodes([]);
        setEdgeWeight("");
        setModalOpened(false);
    }, [selectedNodes, edgeWeight, setEdges]);

    const sendToAPI = async () => {
        const size = nodes.length;
        const trimmedMatrix = trimMatrix(capacityMatrix, size);

        const payload = {
            capacity: trimmedMatrix,
            source: parseInt(source) - 1,
            sink: parseInt(sink) - 1,
        };

        try {
            const response = await axios.post(
                "http://0.0.0.0:8000/ford_falkerson/",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        accept: "application/json",
                    },
                }
            );
            setNotification(`Максимальный поток: ${response.data.max_flow}`);
            setResult(response.data.result);
        } catch (error) {
            console.error("Ошибка при запросе:", error);
            setNotification("Ошибка при выполнении запроса");
            setResult([]);
        }
    };

    const generateExampleGraph = () => {
        const exampleNodes = exampleMatrix.length;
        const newNodes = [];

        for (let i = 0; i < exampleNodes; i++) {
            newNodes.push({
                id: `${i + 1}`,
                data: { label: `${i + 1}` },
                position: { x: Math.random() * 100, y: Math.random() * 100 },
                style: {
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: i === 0 ? "#4CAF50" : "#1E90FF",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                },
            });
        }

        setNodes(newNodes);

        const newEdges = [];
        for (let i = 0; i < exampleMatrix.length; i++) {
            for (let j = 0; j < exampleMatrix[i].length; j++) {
                if (exampleMatrix[i][j] > 0) {
                    newEdges.push({
                        id: `e${i + 1}-${j + 1}`,
                        source: `${i + 1}`,
                        target: `${j + 1}`,
                        label: exampleMatrix[i][j].toString(),
                        animated: true,
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: "#1E90FF",
                        },
                        style: { strokeWidth: 2, stroke: "#1E90FF" },
                        labelStyle: {
                            fill: "white",
                            fontWeight: 600,
                            fontSize: 12,
                        },
                        labelBgStyle: {
                            fill: "#2c2c2c",
                            color: "#fff",
                        },
                        labelBgPadding: [6, 4],
                        labelBgBorderRadius: 4,
                    });
                }
            }
        }
        setEdges(newEdges);
        setCapacityMatrix(exampleMatrix);
    };

    return (
        <Container style={{ padding: "2rem", height: "100vh" }}>
            <Card
                shadow="sm"
                radius="md"
                style={{
                    marginBottom: "1rem",
                    backgroundColor: "#2c2c2c",
                    padding: "1rem",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
                        }}
                    >
                        <Button
                            leftSection={<IconPlus size={18} />}
                            onClick={addNode}
                            variant="gradient"
                            gradient={{ from: "teal", to: "blue", deg: 60 }}
                            style={{
                                transition:
                                    "transform 0.3s ease, background-color 0.3s ease",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                    "scale(1.05)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                            }
                        >
                            Добавить вершину
                        </Button>
                        <Button
                            leftSection={<IconClipboardPlus size={18} />}
                            onClick={generateExampleGraph}
                            variant="gradient"
                            gradient={{ from: "orange", to: "red", deg: 60 }}
                            style={{
                                transition: "transform 0.3s ease",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                    "scale(1.05)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                            }
                        >
                            Пример
                        </Button>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
                        }}
                    >
                        <NumberInput
                            placeholder="Источник"
                            value={source}
                            onChange={(value) => setSource(value)}
                            min={1}
                            style={{
                                width: "150px",
                            }}
                        />
                        <NumberInput
                            placeholder="Сток"
                            value={sink}
                            onChange={(value) => setSink(value)}
                            min={1}
                            style={{
                                width: "150px",
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                        <ActionIcon
                            onClick={sendToAPI}
                            size="lg"
                            variant="gradient"
                            gradient={{ from: "indigo", to: "cyan" }}
                            style={{
                                transition: "transform 0.3s ease",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                    "scale(1.20)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                            }
                        >
                            <IconSend />
                        </ActionIcon>
                    </div>
                </div>
            </Card>
            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Добавить вес ребра"
            >
                <NumberInput
                    label="Вес ребра"
                    value={edgeWeight}
                    onChange={(value) => setEdgeWeight(value)}
                />
                <Button
                    leftSection={<IconExposurePlus1 size={18} />}
                    variant="gradient"
                    gradient={{ from: "teal", to: "blue" }}
                    onClick={createEdge}
                    style={{ marginTop: "1rem" }}
                >
                    Создать ребро
                </Button>
            </Modal>
            <Divider my="sm" />
            <div style={{ width: "100%", height: "50%" }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={handleNodeClick}
                    fitView
                >
                    <Background color="#666" gap={20} />
                    <Controls />
                </ReactFlow>
            </div>
            <Divider my="sm" />
            {result.length > 0 && (
                <Card
                    shadow="lg"
                    radius="md"
                    style={{
                        backgroundColor: "#333",
                        padding: "2rem",
                        marginTop: "2rem",
                        borderRadius: "12px",
                        textAlign: "center",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                        animation: "fadeIn 1s ease-out",
                    }}
                >
                    <Text
                        size="xl"
                        weight={600}
                        color="white"
                        style={{
                            marginBottom: "1.5rem",
                            fontFamily: "'Roboto', sans-serif",
                            background: "linear-gradient(45deg, #f06, #48c6ef)",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                            fontSize: "2rem",
                        }}
                    >
                        Результат:
                    </Text>
                    <div
                        style={{
                            paddingLeft: "1.5rem",
                            paddingRight: "1.5rem",
                        }}
                    >
                        {result.map((line, index) => (
                            <div
                                key={index}
                                style={{
                                    color: "white",
                                    fontSize: "1.2rem",
                                    padding: "0.8rem 1rem",
                                    margin: "0.5rem 0",
                                    borderRadius: "8px",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                    transition:
                                        "background 0.3s ease, transform 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                        "rgba(255, 255, 255, 0.3)";
                                    e.currentTarget.style.transform =
                                        "scale(1.05)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        "rgba(255, 255, 255, 0.1)";
                                    e.currentTarget.style.transform =
                                        "scale(1)";
                                }}
                            >
                                {line}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
            <Transition
                mounted={notification}
                transition="slide-left"
                duration={500}
                timingFunction="ease-in-out"
            >
                {(styles) => (
                    <Notification
                        color="teal"
                        onClose={() => setNotification("")}
                        title="Результат"
                        style={{
                            ...styles,
                            position: "fixed",
                            top: "20px",
                            right: "20px",
                            zIndex: 9999,
                            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
                            width: "300px",
                            animation: "fadeIn 0.5s ease", 
                        }}
                    >
                        {notification}
                    </Notification>
                )}
            </Transition>
        </Container>
    );
};
