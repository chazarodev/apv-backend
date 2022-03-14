import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarID from "../helpers/generarID.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {

    //Verificar si el usuario no se encuentra ya registrado
    const {email, nombre} = req.body;
    const existeUsuario = await Veterinario.findOne({email});
    if (existeUsuario) {
        const error = new Error("Usuario ya registrado");
        return res.status(400).json({msg: error.message});
    }

    try {
        //Guardar un nuevo veterinario
        const veterinario = new Veterinario(req.body);
        //Almacenar en la BD
        const veterinarioGuardado = await veterinario.save();

        //Enviar el email
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token
        });

        res.json({veterinarioGuardado});
    } catch (error) {
        console.log(error);
    }
}

const perfil = (req, res) => {
    const {veterinario} = req; //Extraer variable de veterinario
    res.json(veterinario); //Mandar como respuesta json
}

const confirmar = async (req, res) => {
    const {token} = req.params;

    //Consultar base de datos
    const usuarioConfirmar = await Veterinario.findOne({token});

    if (!usuarioConfirmar) {
        const error = new Error('Token no válido');
        return res.status(404).json({msg: error.message});
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();
        res.json({msg: "Usuario confirmado correctamente"});
    } catch (error) {
        console.log(error);
    }

}

//Función para autenticar alos usuarios
const autenticar = async (req, res) => {
    const {email, password} = req.body

    //Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email});

    if (!usuario) { //Si usuario no existe
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message})
    }
    
    //Comprobar si el usuario confirmó su token
    if (!usuario.confirmado) {
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(403).json({msg: error.message});
    }
    
    //Comprobar password
    if (await usuario.comprobarPassword(password)) {
        //Autenticar al usuario, y generar un token
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        }); //Retornar al usuario para evitar bug en frontend al autenticar
    } else {
        const error = new Error("Credenciales inválidas");
        return res.status(403).json({msg: error.message})
    }
}

const olvidePassword = async (req, res) => {
    const {email} = req.body;

    const existeVeterinario = await Veterinario.findOne({email});
    if (!existeVeterinario) {
        const error = new Error('El usuario no existe');
        return res.status(400).json({msg: error.message});
    }

    try {
        existeVeterinario.token = generarID();//Generar un id único
        await existeVeterinario.save();

        //Enviar email con instrucciones para reestablece password
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        })

        res.json({msg: 'Hemos enviado un email con las instrucciones'});
    } catch (error) {
        console.log(error);
    }
}
const comprobarToken = async (req, res) => {
    const {token} = req.params;
    const tokenValido = await Veterinario.findOne({token});
    if (tokenValido) {
        //El token es válido, por tanto, el usuario existe
        res.json({msg: "No mames el usuario si existe"});
    } else {
        const error = new Error('Token no válido');
        return res.status(400).json({msg: error.message});
    }
}
const nuevoPassword = async (req, res) => {
    const {token} = req.params; //Leer token de la url
    const {password} = req.body; //Leer el password del formulario o input
    const veterinario = await Veterinario.findOne({token});
    if (!veterinario) {
        const error = new Error ('Hubo un error');
        return res.status(400).json({msg: error.message});
    }
    try {
        veterinario.token = null; //Resetear token a null
        veterinario.password = password //Resetar password al nuevo
        await veterinario.save(); //Guardar cambios
        res.json({msg: "Password modificado correctamente"});
    } catch (error) {
        console.log(error);
    }
}

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);
    if (!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }

    const {email} = req.body
    if (veterinario.email !== req.body.email) {
        const existeEmail = await Veterinario.findOne({email});
        if (existeEmail) {
            const error = new Error('Hubo un error');
            return res.status(400).json({msg: error.message});
        }
    }

    try {
        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;

        const veterinarioActualizado = await veterinario.save();
        res.json(veterinarioActualizado);

    } catch (error) {
        console.log(error);
    }
}

const actualizarPassword = async (req, res) => {
    //Leer los datos
    const {id} = req.veterinario
    const {pwd_actual, pwd_nuevo} = req.body

    //Comprobar que el veterinario exista
    const veterinario = await Veterinario.findById(id);
    if (!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }

    //Comprobar su password
    if (await veterinario.comprobarPassword(pwd_actual)) {
        veterinario.password = pwd_nuevo;
        await veterinario.save()
        res.json({msg: 'Password actualizado con éxito'})
    } else {
        const error = new Error('El password actual no es el correcto');
        return res.status(400).json({msg: error.message});
    }

    //Almacenar el nuevo password
}

export {
    registrar,
    perfil,
    confirmar,
    autenticar, 
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}