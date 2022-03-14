import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generarID from "../helpers/generarID.js";

//Definiendo el Schema
const veterinarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    telefono: {
        type: String,
        default: null,
        trim: true
    },
    web: {
        type: String,
        default: null
    },
    token: {
        type: String,
        default: generarID()
    },
    confirmado: {
        type: Boolean,
        default: false
    },
});

veterinarioSchema.pre('save', async function(next) { //Si utilizamos arrow function, nos marcará undifined
    if (!this.isModified('password')) { //Código para evitar volver a hashear un password ya hasheado
        next();
    }
    const salt = await bcrypt.genSalt(10); //Generando el hash
    this.password = await bcrypt.hash(this.password, salt); //Hasheando el password del usuario registrado
})

veterinarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password);
}

const Veterinario = mongoose.model("Veterinario", veterinarioSchema);

export default Veterinario;