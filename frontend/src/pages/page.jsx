import React, { useState, useCallback } from "react";
import { Container, Button, Modal, NumberInput, Notification } from "@mantine/core";
import ReactFlow, {
    Background,
    Controls,
    useEdgesState,
    useNodesState,
    addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios"; // Подключение библиотеки axios

let nodeId = 1;

export const HomePage = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNodes, setSelectedNodes] = useState([]); // Для хранения выделенных узлов
    const [modalOpened, setModalOpened] = useState(false); // Управление модальным окном
    const [edgeWeight, setEdgeWeight] = useState(""); // Хранение веса ребра
    const [capacityMatrix, setCapacityMatrix] = useState([]); // Матрица пропускных способностей
    const [source, setSource] = useState(0); // Источник
    const [sink, setSink] = useState(0); // Сток
    const [notification, setNotification] = useState(""); // Для отображения результатов

    // Функция для добавления узла
    const addNode = () => {
        const newNode = {
            id: `${nodeId}`,
            data: { label: `${nodeId}` },
            position: { x: Math.random() * 100, y: Math.random() * 100 }, // Случайное расположение
            style: {
                width: 30,
                height: 30,
                borderRadius: "50%", // Круглая вершина
                backgroundColor: "#1E90FF",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            },
            connectable: false, // Отключаем хэндлы
        };
        setNodes((nds) => [...nds, newNode]);
        setCapacityMatrix((matrix) => {
            const size = nodeId + 1;
            const updatedMatrix = Array.from({ length: size }, (_, i) =>
                Array(size).fill(0)
            );
            matrix.forEach((row, i) => {
                updatedMatrix[i] = [...row, 0];
            });
            updatedMatrix.push(new Array(size).fill(0));
            return updatedMatrix;
        });
        nodeId += 1;
    };

    // Обработчик нажатий на узлы
    const handleNodeClick = (event, node) => {
        if (selectedNodes.length === 1) {
            setSelectedNodes((prev) => [...prev, node.id]);
            setModalOpened(true); // Открываем модальное окно
        } else {
            setSelectedNodes([node.id]);
        }
    };

    // Функция для создания направленного ребра
    const createEdge = useCallback(() => {
        const [source, target] = selectedNodes;

        if (!source || !target || edgeWeight === "") return;

        const newEdge = {
            id: `e${source}-${target}`,
            source,
            target,
            label: edgeWeight,
            animated: false,
            markerEnd: {
                type: "arrowclosed", // Стрелка на конце ребра
                width: 20,
                height: 20,
            },
            style: { stroke: "white" },
            labelStyle: { fill: "black", fontWeight: 600 },
        };

        setEdges((eds) => addEdge(newEdge, eds));
        setCapacityMatrix((matrix) => {
            const updatedMatrix = [...matrix];
            updatedMatrix[parseInt(source)][parseInt(target)] = parseInt(edgeWeight);
            return updatedMatrix;
        });
        setSelectedNodes([]); // Сбрасываем выбранные узлы
        setEdgeWeight(""); // Сбрасываем вес ребра
        setModalOpened(false); // Закрываем модальное окно
    }, [selectedNodes, edgeWeight, setEdges]);

    // Функция для отправки данных на API
    const sendToAPI = async () => {
        const payload = {
            capacity: capacityMatrix,
            source: parseInt(source),
            sink: parseInt(sink),
        };

        try {
            const response = await axios.post("http://0.0.0.0:8000/ford_falkerson/", payload, {
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
            });
            setNotification(`Максимальный поток: ${response.data.max_flow}`);
        } catch (error) {
            console.error("Ошибка при запросе:", error);
            setNotification("Ошибка при выполнении запроса");
        }
    };

    return (
        <Container
            style={{
                textAlign: "center",
                padding: "2rem",
                justifyContent: "center",
                alignItems: "center",
                height: "90vh",
            }}
        >
            <Button onClick={addNode} style={{ marginBottom: "1rem" }}>
                Добавить вершину
            </Button>
            <NumberInput
                label="Источник (source)"
                placeholder="Введите номер источника"
                value={source}
                onChange={(value) => setSource(value)}
                min={0}
                max={nodeId - 1}
                style={{ marginBottom: "1rem" }}
            />
            <NumberInput
                label="Сток (sink)"
                placeholder="Введите номер стока"
                value={sink}
                onChange={(value) => setSink(value)}
                min={0}
                max={nodeId - 1}
                style={{ marginBottom: "1rem" }}
            />
            <Button onClick={sendToAPI} style={{ marginBottom: "1rem" }}>
                Рассчитать максимальный поток
            </Button>
            <div style={{ width: "100%", height: "80%" }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={handleNodeClick}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>

            {/* Модальное окно для ввода веса ребра */}
            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Добавить вес ребра"
            >
                <NumberInput
                    label="Вес"
                    placeholder="Введите вес ребра"
                    value={edgeWeight}
                    onChange={(value) => setEdgeWeight(value)}
                    min={0}
                    style={{ marginBottom: "1rem" }}
                />
                <Button onClick={createEdge}>Создать ребро</Button>
            </Modal>

            {notification && (
                <Notification onClose={() => setNotification("")}>
                    {notification}
                </Notification>
            )}
        </Container>
    );
};
