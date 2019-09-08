srcDir = ./src
libDir = ./lib

sources := $(subst ./,$(srcDir)/,$(shell cd $(srcDir); find . -name '*.js')) 
outputs := $(addprefix $(libDir)/, $(subst $(srcDir)/,,$(sources)))

lib: $(outputs)

$(libDir)/%.js: $(srcDir)/%.js
	@mkdir -p $(@D)
	npx babel $< -o $@

.PHONY: makeTest clean

makeTest:
	@echo "Sources: '$(sources)'"
	@echo "Outputs: '$(outputs)'"

clean:
	rm -rf $(libDir)/*
