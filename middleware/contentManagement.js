module.exports = function(req, res, next) {
    // 401 Unauthorized
    // 403 Forbidden

    if (!(req.user.role === "CM" || req.user.role === "ADMIN"))
        return res.status(403).send({ error: "Access denied." });
    next();
};