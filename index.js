import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import veterinarioRoutes from './routes/veterinarioRoutes.js'
import pacienteRoutes from './routes/pacienteRoutes.js';

//Creando el servidor
const app = express();

//Indicar que se van a envíar datos de tipo json
app.use(express.json());

dotenv.config(); //Escanea y buscar el archiv .env

//Llamar función para conectar DB
conectarDB();

//Dominios permitidos (CORS)
const dominiosPermitidos = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function (origin, callback) {
        if (dominiosPermitidos.indexOf(origin) !== -1) {
            //El origen del request esta permitido
            callback(null, true)
        } else {
            callback(new Error('No permitido por CORS'))
        }
    }
}

app.use(cors(corsOptions));

//Rutas
app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/pacientes', pacienteRoutes);


const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});