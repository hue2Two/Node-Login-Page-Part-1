exports.register = (req, res) => {
    console.log(`FORM DATA: ${JSON.stringify(req.body)}`);
    res.send("form submitted");
};
