module.exports = function(){

    this.verifyKey = (req, res, next) => {
        if(req.headers['key'] === process.env.DobleViaKey){
            next();
        }
        else{
            res.sendStatus(403);
        }
    }
}