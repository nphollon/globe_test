#! /bin/sh

assert() {
    out=$(eval $1)
    if [ $? != 0 ]; then
        echo "$out"
        exit
    fi
}

echo "Validating..."
assert "jshint scripts"

echo "Testing..."
assert "jasmine-node spec"

echo "Collating..."
assert "browserify scripts/main.js -o scripts-gen/bundle.js"

echo "Minifying..."
assert "ccjs scripts-gen/bundle.js > scripts-gen/min.js"

echo "Build successful!"
