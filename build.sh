#! /bin/sh

echo "Running JSLint..."
out=$(jslint scripts/globe.js)

if [ $? != 0 ]; then
    echo "$out"
    exit
fi
    
echo "Running Jasmine..."
out=$(phantomjs ~/javascript_projects/run-jasmine.js file:///home/nhollon/javascript_projects/globe_test/spec_runner.html)

if [ $? != 0 ]; then
    echo "$out"
    exit
fi

echo "Build successful!"
