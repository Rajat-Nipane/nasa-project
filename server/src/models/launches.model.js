const launches = require('./launches.mongo')
const planets = require('./planets.mongo')
const axios = require('axios')


const DEFAULT_FLIGHT_NUMBER = 100


async function findLaunch(filter){
    return await launches.findOne(filter)
}

async function existsLaunchWithId(launchId){
    return await findLaunch({
        flightNumber:launchId
    });
}

async function getLatestFlightNumber(){
    const latestLaunch = await launches.findOne({}).sort('-flightNumber')

    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER
    }
    return latestLaunch.flightNumber
}

async function getAllLaunches(skip,limit){
    // return Array.from(launches.values());

    return await launches.find({},{
        _id:0,__v:0
    }).sort({flightNumber:1}).skip(skip).limit(limit)
}

async function saveLaunch(launch){
    await launches.findOneAndUpdate({
        flightNumber:launch.flightNumber
    },launch,{
        upsert:true
    })
}

async function scheduleNewLaunch(launch){

    const planet = await planets.findOne({
        keplerName: launch.target,
    })

    if(!planet){
        throw new Error('No matching planet was found')
    }


    const newFlightNumber = await getLatestFlightNumber() + 1
    const newLaunch = Object.assign(launch,{
        customer: ['Zero to Mastery','NASA'],
        flightNumber:newFlightNumber,
        upcoming : true,
        success: true,
})

await saveLaunch(newLaunch)
}


async function abortLaunchById(launchId){
    // console.log(launchId,"this is the one")
    const aborted = await launches.updateOne({
        flightNumber:launchId,
    },{
        upcoming:false,
        success:false,
    })
    console.log(aborted,"this is aborted val from model")
    return aborted.modifiedCount === 1;
}

const SPACEX_API_URL = 'http://api.spacexdata.com/v3/launches'

//Spacex Functions
async function loadLaunchData(){

    const firstLaunch = await findLaunch({
        flightNumber:1,
        rocket:'Falcon 1',
        mission:'FalconSat'
    })

    if(firstLaunch){
        console.log('Launch data already loaded')
        return;
    }
    // else{
    //     await populateLaunches()
    // }
    
    const response = await axios.get(SPACEX_API_URL)

    if(response.status !== 200){
        console.log('Problem downloading launch data')
        throw new Error('Launch data download failed')
    }
    const launchDocs = response.data;
    for(const launchDoc of launchDocs){

        // const payloads = launchDoc['payloads']
        // const customers = payloads.flatMap((payload) => {
        //     return payload['customers']
        // })

        const launch = {
            flightNumber:launchDoc['flight_number'],
            mission:launchDoc['mission_name'],
            rocket:launchDoc['rocket']['rocket_name'],
            launchDate:launchDoc['launch_date_local'],
            upcoming:launchDoc['upcoming'],
            success:launchDoc['launch_success'],
            customers:launchDoc.rocket.second_stage.payloads[0].customers
        }

        console.log(`${launch.flightNumber} ${launch.mission}`)


        //Populate launches collection
        await saveLaunch(launch)
    }
}


module.exports = {
    getAllLaunches,
    existsLaunchWithId,
    abortLaunchById,
    scheduleNewLaunch,
    loadLaunchData
}