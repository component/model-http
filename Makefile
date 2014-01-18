
build: components index.js
	@component build --dev

clean:
	@rm -rf build components node_modules

components: component.json
	@component install --dev

node_modules: package.json
	@npm install

server: node_modules
	@node test/server

test: build
	@open http://localhost:4200

.PHONY: clean server test