require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const User = require("./src/models/userModel");

const app = express();
app.use(cookieParser());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://tech-zone-eight.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
app.set("socketio", io);
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.getById(decoded.id);

    if (!user || !user.is_active) {
      return next(new Error("Account disabled"));
    }

    socket.userId = user.id;

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user_${socket.userId}`);
  socket.on("disconnect", () => {});
});

app.use(
  cors({
    origin: ["http://localhost:5173", "https://tech-zone-eight.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());

const db = require("./src/config/db");

db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully (Pool mode)!");
    connection.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/products", require("./src/routes/productRoutes"));
app.use("/api/cart", require("./src/routes/cartRoutes"));
app.use("/api/orders", require("./src/routes/orderRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/coupons", require("./src/routes/couponRoutes"));
app.use("/api/brands", require("./src/routes/brandRoutes"));
app.use("/api/dashboard", require("./src/routes/dashboardRoutes"));

app.get("/", (req, res) => {
  res.send("<h1>Chào mừng! Server Backend đang chạy ổn định.</h1>");
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`-------------------------------------------`);
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`-------------------------------------------`);
});
