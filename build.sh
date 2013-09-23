#! /bin/sh

assert() {
    out=$(eval $1)
    if [ $? != 0 ]; then
        echo "$out"
        exit
    fi
}

echo "Running JSLint..."
assert "jslint scripts/globe.js"
    
echo "Running Jasmine..."
assert "phantomjs run-jasmine.js spec_runner.html"

echo "Running Google Closure..."
assert "java -jar compiler.jar --js scripts/globe.js --js_output_file scripts/min.js"

echo "Build successful!"
