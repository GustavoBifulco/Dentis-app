import nodemailer from 'nodemailer';

// Criação do transportador SMTP
// As credenciais devem estar no .env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true' || true, // true para 465, false para outras portas
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export const sendEmail = async ({ to, subject, html, text }: EmailOptions) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ Credenciais de email (SMTP) não configuradas no .env. Email não enviado.');
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from: `Dentis OS <${process.env.SMTP_USER}>`, // Remetente padrão
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>?/gm, ''), // Fallback texto plano simples
        });

        console.log(`📧 Email enviado: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('🔥 Erro ao enviar email:', error);
        return false;
    }
};
