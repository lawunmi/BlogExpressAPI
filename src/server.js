import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ message: "Health check OK" });
});

app.use(userRoutes);
app.use(postRoutes);

// Swagger setup
const swaggerDocument = YAML.load("src/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((error, req, res, next) => {
  return res.status(error.status || 500).json({
    status: "fail",
    message: error.message || "Internal server error",
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
