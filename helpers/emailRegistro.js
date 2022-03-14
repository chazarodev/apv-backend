import nodemailer from 'nodemailer';

//Credenciales para el envío de emails
const emailRegistro = async (datos) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const {email, nombre, token} = datos;

    //Envíar el email
    const info = await transporter.sendMail({
        from: "APV - Administrador de Pacientes de Veterinaria",
        to: email,
        subject: 'Comprueba tu cuenta en APV',
        text: 'Comprueba tu cuenta en APV',
        html: `<p>Hola ${nombre} comprueba tu cuenta en APV.</p>
                <p>Tu cuenta ya está lista, solo compruebala en el siguiente enlace:
                    <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>
                </p>
                <p>Si tú no creaste esta cuenta puede ignorar este email</p>
        `
    });
}

export default emailRegistro;