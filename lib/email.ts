const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

interface EnvoyerEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function envoyerEmail({ to, subject, html }: EnvoyerEmailOptions) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "GK Sensei <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Erreur Resend:", data);
      return { succes: false, erreur: data };
    }

    return { succes: true, data };
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return { succes: false, erreur: error };
  }
}

export function templateCode(code: string, titre: string, message: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #FAF5E8;">
      <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #E8DFC8;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 20px; color: #0F172A; margin: 0 0 4px 0;">GK Sensei</h1>
          <p style="font-size: 12px; color: #64748b; margin: 0;">${titre}</p>
        </div>

        <p style="font-size: 13px; color: #334155; line-height: 1.6;">${message}</p>

        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Votre code</p>
          <p style="font-size: 32px; font-weight: 900; color: #1D4ED8; margin: 0; letter-spacing: 4px;">${code}</p>
        </div>

        <p style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
          Ce code est valable <strong>15 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
        </p>

        <hr style="border: none; border-top: 1px solid #E8DFC8; margin: 20px 0;" />

        <p style="font-size: 10px; color: #94a3b8; text-align: center; margin: 0;">
          GK Sensei — Complexe Commercial<br />
          Kinshasa, RDC
        </p>
      </div>
    </div>
  `;
        }
