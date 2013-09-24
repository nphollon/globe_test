#! /bin/sh

assert() {
    out=$(eval $1)
    if [ $? != 0 ]; then
        echo "$out"
        exit
    fi
}

echo "Validating..."
assert "jslint scripts/globe.js"

echo "Testing..."
assert "phantomjs run-jasmine.js spec_runner.html"

echo "Minifying..."
assert "java -jar compiler.jar --js scripts/globe.js --js_output_file scripts/min.js"

echo "Testing minified JS..."
assert "phantomjs run-jasmine.js min_spec_runner.html"

echo "Build successful!"
