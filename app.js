/* Servidor Express */
import express from "express";
import mongoDB from "./src/config/mongoose.config.js";
import productRouter from "./src/router/api.product.routes.js";
import viewsProductRouter from "./src/router/app.product.routes.js";
import cartRouter from "./src/router/api.cart.routes.js";
import viewsCartRouter from "./src/router/app.cart.routes.js";
import viewsRouter from "./src/router/views.routes.js";
import PATH from "./src/utils/path.js";
import handlebars from "./src/config/handlebars.config.js";
import serverSocket from "./src/config/socket.config.js";

const PORT = 8080;
const HOST = "localhost"; // 127.0.0.1
const APP = express();

APP.use(express.urlencoded({ extended: true })); // para recibir los datos en urlencoded desde postman
APP.use(express.json());

// configuracion del motor de plantillas
handlebars.CONFIG(APP);

// declaracion de ruta estatica
APP.use("/", express.static(PATH.css));
APP.use("/", express.static(PATH.js));
APP.use("/", express.static(PATH.images));
APP.use("/products", express.static(PATH.css));
APP.use("/products", express.static(PATH.images));
APP.use("/carts", express.static(PATH.css));
APP.use("/realTimeProducts", express.static(PATH.js));
APP.use("/realTimeProducts", express.static(PATH.css));
APP.use("/realTimeProducts", express.static(PATH.images));

// Declaración de enrutadores
APP.use("/", viewsRouter);
APP.use("/carts", viewsCartRouter);
APP.use("/products", viewsProductRouter);
APP.use("/api/products", productRouter);
APP.use("/api/carts", cartRouter);

// Metodo que gestiona las rutas inexistentes.
APP.use("*", (req, res) => {
    return res.status(404).send("<h1>Error 404: Not Found</h1>");
});

// control de errores internos
APP.use((error, req, res) => {
    console.log("Error:", error.message);
    res.status(500).send("<h1>Error 500: Error en el Servidor</h1>");
});

// metodo oyente de solicitudes
const serverHTTP = APP.listen(PORT, () => {
    console.log(`Ejecutandose en http://${HOST}:${PORT}`);
    mongoDB.connectDB();
});

// asi enviamos el serverHttp al socket.config.js.
serverSocket.CONFIG(serverHTTP);
