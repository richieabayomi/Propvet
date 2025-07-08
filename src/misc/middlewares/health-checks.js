module.exports.handleAPIHealthChecks = function handleAPIHealthChecks(req, res) {
    return res.json({
        ok: true,
        environment: process.env.NODE_ENV
    });
}

module.exports.handleAPIWhitlistEndponts = function handleAPIWhitlistEndponts(req, res, next) {
    return res.status(404)
        .json({ 
            status: 'INVALID_ROUTE', 
            msg: 'This route is not supported' 
    });
}

module.exports.handleAPIHealthStatus = function handleAPIHealthStatus(req, res) {
    return res.json({
        msg: `Hello ${req.params.name}`
    });
}