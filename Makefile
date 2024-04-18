.PHONY: help clean image data.json run bash

help:
	@echo "make clean"
	@echo "make image"
	@echo "make data.json"
	@echo "make run"
	@echo "make static"
	@echo "make bash"

clean:
	@podman rmi localhost/coley-data-server:latest || true
	@rm -f data.json _data.json

image:
	@podman build -t localhost/coley-data-server:latest --format=docker .

data.json: image
	@podman create --name data_ctr localhost/coley-data-server:latest
	@podman cp data_ctr:/app/dist/data.json ./_data.json
	@podman rm data_ctr
	@cat _data.json | jq . > data.json
	@rm -f _data.json

run: image
	@fuser --kill 4000/tcp || true
	@podman run -it --rm -p 4000:4000 localhost/coley-data-server:latest || true

static: image
	@fuser --kill 4000/tcp || true
	@podman run -it --rm -p 4000:4000 -v ${PWD}/src/static:/app/dist/static:ro localhost/coley-data-server:latest || true

app: image
	@fuser --kill 4000/tcp || true
	@podman run -it --rm -p 4000:4000 -v ${PWD}:/app:rw localhost/coley-data-server:latest /bin/bash || true

bash: image
	@fuser --kill 4000/tcp || true
	@podman run -it --rm -p 4000:4000 localhost/coley-data-server:latest /bin/bash || true
