const http = require("http");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// const { initializeWebSocket } = require('./services/socket-events');


require("dotenv").config();

const {handleAPIWhitlistEndponts} = require("./misc/middlewares/health-checks");
const authRoutes = require('./routes/auth.routes');
const verificationRoutes = require('./routes/verification.routes.updated');



const app = express();
const server = http.createServer(app);

// initializeWebSocket(server)

//middlewares
app.disable("x-powered-by");
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({}));

// Multer setup for handling multipart/form-data
const multer = require('multer');
const upload = multer();

// Export upload for use in route files
module.exports.upload = upload;

//HANDLE ROUTES
// app.use('/v1/route', handlers);
// app.use('/v1/user', UserAdminRoutes);
// app.use("/v1/supports", supportRoutes);

app.use('/auth', authRoutes);
app.use('/verification', verificationRoutes);

app.get("*", handleAPIWhitlistEndponts);
module.exports.server = server;
module.exports.app = app;
