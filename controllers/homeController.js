module.exports={
showAbout :(req, res) => {
    res.render("about");
},
showEvents : (req, res) => {
    res.render("events");
},
showContact : (req, res) => {
    res.render("contact");
},
respondHome : (req, res) => {
    res.render("index");
},
chat: (req, res) => {
    res.render("chat");
},
showFacilities:(req,res)=>{
    res.render("facilities");
},
showMembership:(req,res)=>{
    res.render("membership");
},
showPrograms:(req,res)=>{
    res.render("programs");
},
showJobs : (req, res) => {
    res.render("jobs"); 
}};
