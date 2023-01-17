import {injectable, bind, BindingScope} from '@loopback/core';
import {createTransport} from 'nodemailer';
import {EmailTemplate, NodeMailer, User} from '../models';

@bind({scope: BindingScope.TRANSIENT})
export class EmailService {
  /**
   * If using gmail see https://nodemailer.com/usage/using-gmail/
   */
  private static async setupTransporter() {
    return createTransport({
      host: process.env.SMTP_SERVER,
      port: +process.env.SMTP_PORT!,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  async sendResetPasswordMail(user: User): Promise<any> {
    const transporter = await EmailService.setupTransporter();
    const emailTemplate = new EmailTemplate({
      to: user.email,
      subject: 'Notification réinitialisation du mot de passe Hotel',
      html: `
      <div>
        <p>Bonjour ${user.username},</p>
        
        <p style="color: red;">Nous avons reçu une demande de réinitialisation du mot de passe de votre compte</p>

        <p>Voici votre code de vérification: ${user.resetKey}</a>
               
        <p>Merci !</p>
        <p>L'équipe TTHotel</p>

      </div>
      `,
    });
    return transporter.sendMail(emailTemplate);

  }


  async emailNewUser(user: User): Promise<any> {
    const transporter = await EmailService.setupTransporter();
    const emailTemplate = new EmailTemplate({
      to: user.email,
      subject: 'Notification mail from Hotel',
      html: `
      <div>

        <p>Bonjour ${user.username},</p>

        <p>Votre compte a été créé avec succès.</p>
        
        <p>Connectez-vous avec le compte ${user.email} et le mot de passe ${user.password}.</p>

        <p>Votre code fournisseur c'est ${user.lockSupplier}.</p>

        <p>Merci !</p>
        
        <p>L'équipe TTHotel</p>

      </div>
      `,
    });
    return transporter.sendMail(emailTemplate);

  }


  async emailHotel(user: User): Promise<any> {
    const transporter = await EmailService.setupTransporter();
    const emailTemplate = new EmailTemplate({
      to: user.email,
      subject: 'Notification mail from Hotel',
      html: `
      <div>

        <p>Bonjour,</p>

        <p>Votre hôtel a été créé avec succès. Connectez-vous avec le compte ${user.email}.</p>

        <p>Votre Mot de passe c'est ${user.password}.</p>

        <p>Merci !</p>
        
        <p>L'équipe TTHotel</p>

      </div>
      `,
    });
    return transporter.sendMail(emailTemplate);

  }
}