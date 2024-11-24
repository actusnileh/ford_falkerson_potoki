DC = docker compose
BACKEND_FILE = docker/backend.yaml
FRONTEND_FILE = docker/frontend.yaml

.PHONY: all
all:
	${DC} -f ${FRONTEND_FILE} up --build -d
	${DC} -f ${BACKEND_FILE} up --build -d

.PHONY: drop-all
drop-all:
	${DC} -f ${BACKEND_FILE} -f ${FRONTEND_FILE}  down

.PHONY: front
front:
	${DC} -f ${FRONTEND_FILE} up --build -d

.PHONY: drop-front
drop-front:
	${DC} -f ${FRONTEND_FILE}  down

.PHONY: back
back:
	${DC} -f ${BACKEND_FILE} up --build -d

.PHONY: drop-back
drop-back:
	${DC} -f ${BACKEND_FILE}  down

.PHONY: logs
logs:
	${DC} -f ${BACKEND_FILE} -f ${FRONTEND_FILE} logs -f