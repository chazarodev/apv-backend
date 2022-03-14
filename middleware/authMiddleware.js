import jwt from "jsonwebtoken";
import Veterinario from "../models/Veterinario.js";

const checkAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { //Comprobar que existe un token
        try {
            token = req.headers.authorization.split(' ')[1]; //Asignar a la variable token el token quitando el bearer
            const decoded = jwt.verify(token, process.env.JWT_SECRET); //Verificar el usuario que está intenado autenticarse
            req.veterinario = await Veterinario.findById(decoded.id).select("-password -token -confirmado");//Creamos una sesión
            //decoded es un objeto, por tanto, accedemos al id y omitimos de la consulta el password, el token y el satus confirmado
            return next(); //continuar al siguiente middleware
        } catch (error) {
            const e = new Error('Token no válido');
            return res.status(403).json({msg: e.message});
        }
    } 
    
    if (!token) {
        const error = new Error('Token no válido o inexistente');
        res.status(403).json({msg: error.message});
    }
    next();
}

export default checkAuth;