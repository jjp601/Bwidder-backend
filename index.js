require("dotenv").config();

const express       = require("express"),
      app           = express(),
      cors          = require("cors"),
      bodyParser    = require("body-parser"),
      errorHandler  = require("./handlers/error"),
      authRoutes    = require("./routes/auth"),
      messagesRoutes    = require("./routes/messages"),
      { loginRequired, authorizeUser } = require("./middleware/auth"),
      db            = require("./models");

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/users/:id/messages", loginRequired, authorizeUser, messagesRoutes);

app.get("/api/messages", loginRequired, async function(req, res, next) {
    try {
        let messages = await db.Message.find()
            .sort({createdAt: "desc"})
            .populate("user", {
                username: true,
                profileImg: true
            });
        return res.status(200).json(messages);
    } catch (err) {
        return next(err);
    }
});

app.use(function(req, res, next) {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}.`);
})
