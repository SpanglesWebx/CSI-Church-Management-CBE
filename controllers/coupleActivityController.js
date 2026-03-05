const CoupleActivity = require("../Schema/CoupleActivitySchema");

exports.createActivity = async (req,res)=>{
try{

const activity = new CoupleActivity(req.body);

await activity.save();

res.status(201).json({
status:"Success",
message:"Activity Created",
activity
});

}catch(err){

res.status(500).json({
status:"Failed",
message:err.message
});

}
};



exports.getActivities = async(req,res)=>{

try{

const page = parseInt(req.query.page)||1;

const limit=10;

const skip=(page-1)*limit;

const {startDate,endDate,search,status}=req.query;

const filter={};

if(startDate && endDate){

filter.date={
$gte:new Date(startDate),
$lte:new Date(endDate)
};

}

if(status && status!=="All"){

filter.status=status;

}


if(search){

const regex=new RegExp(search,"i");

filter.$or=[

{activityType:regex},
{title:regex},
{churchName:regex},
{customTitle:regex},
{"leader.name":regex},
{"houses.name":regex}

];

}



const [activities,total]=await Promise.all([

CoupleActivity.find(filter)
.sort({createdAt:-1})
.skip(skip)
.limit(limit),

CoupleActivity.countDocuments(filter)

]);


res.json({

activities,
currentPage:page,
totalPages:Math.ceil(total/limit)

});


}catch(err){

res.status(500).json({
status:"Failed",
message:err.message
});

}

};



exports.markAttendance = async(req,res)=>{

try{

const {id}=req.params;

const {attendees}=req.body;

const activity = await CoupleActivity.findById(id);

if(!activity)

return res.status(404).json({
status:"Failed",
message:"Activity not found"
});


activity.attendees=attendees;

await activity.save();


res.json({
status:"Success",
message:"Attendance Updated",
activity
});


}catch(err){

res.status(500).json({
status:"Failed",
message:err.message
});

}

};



exports.getAttendanceSummary=async(req,res)=>{

try{

const {id}=req.params;

const activity=await CoupleActivity.findById(id);


const totalPresent=activity.attendees.filter(a=>a.status==="present").length;

const membersPresent=activity.attendees.filter(a=>a.status==="present" && a.isMember).length;

const guestsPresent=activity.attendees.filter(a=>a.status==="present" && !a.isMember).length;

const totalMembers=activity.attendees.filter(a=>a.isMember).length;


res.json({

totalPresent,
membersPresent,
guestsPresent,
totalMembers

});


}catch(err){

res.status(500).json({
status:"Failed",
message:err.message
});

}

};



exports.updateActivity=async(req,res)=>{

try{

const {id}=req.params;

const activity=await CoupleActivity.findById(id);

if(!activity)

return res.status(404).json({
status:"Failed",
message:"Activity not found"
});


const updatedActivity=

await CoupleActivity.findByIdAndUpdate(

id,
req.body,
{new:true}

);


res.json({

status:"Success",
message:"Activity Updated",
activity:updatedActivity

});


}catch(err){

res.status(500).json({
status:"Failed",
message:err.message
});

}

};