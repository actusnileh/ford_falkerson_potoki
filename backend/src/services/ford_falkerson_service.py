from collections import deque


def ford_falkerson_service(
    capacity: list[list[int]], source: int, sink: int
) -> tuple[float, str]:
    result = []
    n = len(capacity)  # Количество вершин
    flow = [[0] * n for _ in range(n)]  # Матрица потока

    def bfs():
        parent = [-1] * n
        parent[source] = source
        queue = deque([source])
        while queue:
            u = queue.popleft()
            for v in range(n):
                if parent[v] == -1 and capacity[u][v] - flow[u][v] > 0:
                    parent[v] = u
                    if v == sink:
                        return parent
                    queue.append(v)
        return None

    max_flow = 0
    step = 1  # Шаг алгоритма для описания действий

    while (parent := bfs()) is not None:
        result.append(f"\nШаг {step}: Найдена увеличивающая цепь")

        # Восстановление пути
        path = []
        v = sink
        while v != source:
            path.append(v + 1)  # Преобразуем индексы обратно в нумерацию вершин
            v = parent[v]
        path.append(source + 1)
        path.reverse()
        result.append(f"Увеличивающая цепь: {' -> '.join(map(str, path))}")

        # Найти минимальную остаточную пропускную способность вдоль пути
        path_flow = float("Inf")
        v = sink
        while v != source:
            u = parent[v]
            path_flow = min(path_flow, capacity[u][v] - flow[u][v])
            v = u
        result.append(f"Минимальная пропускная способность вдоль пути: {path_flow}")

        # Обновить потоки вдоль пути
        result.append("Обновляем потоки в сети:")
        v = sink
        while v != source:
            u = parent[v]
            flow[u][v] += path_flow
            flow[v][u] -= path_flow
            result.append(
                f"  Поток на ребре {u + 1} -> {v + 1} увеличен до {flow[u][v]}"
            )
            v = u

        max_flow += path_flow
        result.append(f"Добавлено в общий поток: {path_flow}")
        result.append(f"Текущий максимальный поток: {max_flow}")

        step += 1

    return max_flow, result
