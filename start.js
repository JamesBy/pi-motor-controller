// start.js
// Responsible for starting and runing the server and listening and executing socket io calls

//These two variables may need to be changed
//  default port
var port = process.argv[2] || 3150;

//The Server code comes straight from:
//https://gist.github.com/rpflorence/701407
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

 
app = http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

    fs.exists(filename, function(exists) {
    if(!exists) {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
    return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
    if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
    return;
    }

    response.writeHead(200);
    response.write(file, "binary");
    response.end();
    });
    });
}).listen(parseInt(port, 10));
 

// http://stackoverflow.com/a/8440736
// Get the local ip to display to the user
var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

if (addresses.length > 0)
    console.log("Static file server running at\n  => http://"+addresses[0]+":" + port + "/\nCTRL + C to shutdown");
else
    console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

var gpio = require("pi-gpio");
var moveBot = require("./DriveClass.js");

moveBot.openAll(gpio);

var io = require('socket.io')(app);

io.on('connection', function(socket){

    socket.on('move', function(msg){
        switch (msg){
            case 'forwards':

              moveBot.rightForwards();
              moveBot.leftForwards();
                break;
        
            case 'forwardsRight':

                moveBot.stopLeft();
                moveBot.rightForwards();
                break;

            case 'right':

                moveBot.rightForwards();
                moveBot.leftBack();
                break;

            case 'backRight':

                moveBot.stopLeft();
                moveBot.rightBack();
                break;

            case 'back':

                moveBot.rightBack();
                moveBot.leftBack();
                break;

            case 'backLeft':

                moveBot.stopRight();
                moveBot.leftBack();
                break;

            case 'left':

                moveBot.leftForwards();
                moveBot.rightBack();
                break;

            case 'forwardsLeft':

                moveBot.stopRight();
                moveBot.leftForwards();
                break;

            case 'stop':

                moveBot.stopAll(function(ans){
                    socket.emit('messageSuccess',ans);
                });
                break;
        }
    });
});

// http://stackoverflow.com/a/14032965
// Clean up the gpio
process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    moveBot.closeAll(gpio);
}
//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
