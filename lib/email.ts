import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_FROM_EMAIL!;
const to = process.env.ALERT_EMAIL!;

export async function sendDownAlert(
  endpointName: string,
  endpointUrl: string,
  startedAt: Date,
) {
  await resend.emails.send({
    from,
    to,
    subject: `🔴 ${endpointName} is down`,
    html: `
      <p><strong>${endpointName}</strong> (${endpointUrl}) went down at ${startedAt.toLocaleString()}.</p>
      <p>We'll let you know as soon as it recovers.</p>
    `,
  });
}

export async function sendRecoveredAlert(
  endpointName: string,
  endpointUrl: string,
  downForSeconds: number,
) {
  const minutes = Math.floor(downForSeconds / 60);
  const seconds = downForSeconds % 60;
  const duration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  await resend.emails.send({
    from,
    to,
    subject: `🟢 ${endpointName} has recovered`,
    html: `
      <p><strong>${endpointName}</strong> (${endpointUrl}) is back up.</p>
      <p>It was down for ${duration}.</p>
    `,
  });
}
