require('dotenv').config()

const http = require('http');
const app = require('./app');
const {mongoConnect} = require('./services/mongo')


const {loadLaunchData} = require('./models/launches.model')

const {loadPlanetsData} = require('./models/planets.model')

const PORT = process.env.PORT || 8000;

const server = http.createServer(
    app
);



async function startServer(){
    
    await mongoConnect()
    
    await loadPlanetsData();
    
    await loadLaunchData()
   
    server.listen(PORT, () => {
        console.log('Listening on Port:',PORT)
    })
}

startServer();