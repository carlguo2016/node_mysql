const Log = require('./lib/log');
const Core = require('./lib/core');
const ActionMap = require('./api');
const Const = require('./lib/const');

let express = require('express');
let app = express();
let router = express.Router();
let bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

Core.installAction(router, ActionMap);

app.use(router);
app.use(Core.errorHandler);
app.use(Core.notFoundHandler);


let server = app.listen(Const.END_POINT, function () {
	let host = server.address().address;
	let port = server.address().port;
    Log.i(`app listening at http://${host}:${port}`);
});

