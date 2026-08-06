import nodemailer from "nodemailer";
import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";

const region = process.env.AWS_REGION;

if (!region) {
  throw new Error(
    "AWS_REGION environment variable is required."
  );
}

const sesClient = new SESv2Client({
  region,
});

export const emailTransporter =
  nodemailer.createTransport({
    SES: {
      sesClient,
      SendEmailCommand,
    },
  });