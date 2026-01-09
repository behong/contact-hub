import { Resend } from 'resend';

type ContactMailParams = {
  site: string;
  returnUrl: string;
  memo: string;
  contact: string;
  timestamp: string;
  ip: string;
  userAgent: string;
};

export async function sendContactMail(params: ContactMailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TO_EMAIL;
  const from = process.env.FROM_EMAIL;

  if (!apiKey || !to || !from) {
    throw new Error('Missing mail configuration');
  }

  const resend = new Resend(apiKey);
  const subject = `[Inquiry][${params.site}] New memo`;
  const text = [
    `Site: ${params.site}`,
    `Page: ${params.returnUrl}`,
    'Memo:',
    params.memo,
    '',
    `Contact(optional): ${params.contact || '-'}`,
    `Time(KST): ${params.timestamp}`,
    `IP: ${params.ip}`,
    `UA: ${params.userAgent}`,
  ].join('\n');

  await resend.emails.send({
    from,
    to,
    subject,
    text,
  });
}
