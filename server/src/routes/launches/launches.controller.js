const {getAllLaunches,scheduleNewLaunch,existsLaunchWithId, abortLaunchById} = require('../../models/launches.model')
const {getPagination} = require('../../services/query')

async function httpGetAllLaunches(req,res) {
    const {skip,limit} =  getPagination(req.query)
    return res.status(200).json(await getAllLaunches(skip,limit));
}

async function httpAddNewLaunch(req,res){
    const launch = req.body
    
    if(!launch.mission || !launch.target || !launch.launchDate || ! launch.rocket)
    {
        return res.status(400).json({
            error:'Missing Required launch property'
        })
    }

    launch.launchDate = new Date(launch.launchDate)

    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error: 'Invalid Launch Date',
        })
    }
    await scheduleNewLaunch(launch)
    return res.status(201).json(launch)
}

async function httpAbortLaunch(req,res){
    const launchId = +req.params.id
    const existsLaunch = await existsLaunchWithId(launchId)
    if(!existsLaunch){
        return res.status(200).json({
            error: 'Launch Not Found'
        })
    }
    
    const aborted = await abortLaunchById(launchId)
    console.log(aborted,"val from controller")
    if(!aborted){
        return res.status(400).json({
            error:'Launch Not Aborted'
        })
    }
    return res.status(200).json({ok:true})
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}