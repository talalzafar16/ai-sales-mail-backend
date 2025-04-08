require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routers/authRoutes");
const emailRoutes = require("./routers/emailRoutes");
const templateRoutes = require("./routers/templateRoutes");
const campaignRoutes = require("./routers/compaignRoutes");
const automatedEmailRoutes = require("./routers/AutomatedReply");
const FollowUpRoutes = require("./routers/FollowUpRoutes");
const cors = require("cors");
const app = express();
const morgan = require("morgan");

connectDB();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/auth", authRoutes);
app.use("/email", emailRoutes);
app.use("/templates", templateRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/automated-reply", automatedEmailRoutes);
app.use("/follow-up", FollowUpRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
