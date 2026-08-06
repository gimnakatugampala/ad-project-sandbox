import { emailTransporter } from "./ses";

type SendModerationEmailInput = {
  to: string;
  sellerName: string | null;
  advertisementTitle: string;
  decision: "APPROVED" | "REJECTED";
  note?: string | null;
};

export async function sendModerationEmail({
  to,
  sellerName,
  advertisementTitle,
  decision,
  note,
}: SendModerationEmailInput) {
  const fromEmail = process.env.SES_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error(
      "SES_FROM_EMAIL environment variable is required."
    );
  }

  const isApproved = decision === "APPROVED";

  const subject = isApproved
    ? `Advertisement approved: ${advertisementTitle}`
    : `Advertisement rejected: ${advertisementTitle}`;

  const textParts = [
    `Hello ${sellerName ?? "Seller"},`,

    isApproved
      ? `Your advertisement "${advertisementTitle}" has been approved and is now publicly available.`
      : `Your advertisement "${advertisementTitle}" has been rejected.`,

    !isApproved && note
      ? `Moderator's reason: ${note}`
      : null,

    "Thank you for using our classified advertisements platform.",
  ];

  const text = textParts
    .filter((part): part is string => Boolean(part))
    .join("\n\n");

  return emailTransporter.sendMail({
    from: fromEmail,
    to,
    subject,
    text,
  });
}