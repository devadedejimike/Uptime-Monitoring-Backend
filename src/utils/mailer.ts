import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PWD
    }
});

export const sendEmail = async (to: string, subject: string, text: string) => {
    try{
        await transporter.sendMail({
        from: `"Uptime Monitor"  <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text
    })
    console.log("Email sent")
    } catch(error) {
        console.error("Email failed", error)
    }
}