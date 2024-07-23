import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER as string;

const client = twilio(accountSid, authToken);

export const makeCall = async (
  to: string,
  appointmentId: string
): Promise<void> => {
  try {
    await client.calls.create({
      url: `${process.env.TWILIO_CALL_URL}/twilio/voice?appointmentId=${appointmentId}`,
      to,
      from: fromPhoneNumber,
    });
    console.log("Call initiated successfully.");
  } catch (error) {
    console.error("Error initiating call:", error);
    throw error;
  }
};
