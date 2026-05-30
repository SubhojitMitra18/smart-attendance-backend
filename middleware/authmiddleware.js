const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {

    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        'secret_key'
      );

      req.teacher = decoded.id;

      next();

    } else {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }

  } catch (error) {
    return res.status(401).json({
      message: "Token Failed",
    });
  }
};

module.exports = protect;