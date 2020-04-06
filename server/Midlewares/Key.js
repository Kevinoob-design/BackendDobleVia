module.exports = function(){

    this.verifyKey = (req, res, next) => {
        if(req.headers['key'] === process.env.DobleViaKey){
            next();
        }
        else{
            console.log('------------------------------- FORBIDDEN REQUEST ------------------------------- ');
            console.log(req);
            console.log('------------------------------- FORBIDDEN REQUEST ------------------------------- ');
            res.sendStatus(403);
        }
    }
}