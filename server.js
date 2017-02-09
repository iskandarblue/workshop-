var Tilesplash = require('tilesplash');


var con = {
  user : "awsuser",
  database : "mydb",
  password : "mypassword",
  port : 5432,
  host : "mydbinstance.cpu2z0a5bugq.us-east-2.rds.amazonaws.com"
};

var app = new Tilesplash(con);
// подсоединяемся к базе, test_user имя пользователя, test_database имя базы данных


app.logLevel('debug');

// в боевой версии это не надо, просто для доступа к серверу с любого места
var userMiddleware = function (req, res, tile, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

// настраиваем отображение наших данных
app.layer('parcel11', userMiddleware, function(tile, render){
  render(
    {
      // выборка данных из базы
      pol : 'SELECT ST_AsGeoJSON(wkb_geometry) as the_geom_geojson, parcel11.sptbcode FROM parcel11 WHERE ST_Intersects(wkb_geometry, !bbox_4326!)'
    });
});

app.server.listen(3000);
