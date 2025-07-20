declare module "@getbrevo/brevo" {
  interface EmailAddress {
    email: string;
    name?: string;
  }

  interface EmailData {
    sender: EmailAddress;
    to: EmailAddress[];
    subject: string;
    htmlContent: string;
    textContent?: string;
    replyTo?: EmailAddress;
  }

  interface BrevoTransport {
    send: (data: EmailData) => Promise<any>;
  }

  export function createTransport(config: { apiKey: string }): BrevoTransport;
}
