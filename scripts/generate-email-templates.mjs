/**
 * Generate every Supabase auth email template from one branded shell.
 *
 * Thirteen templates share a masthead, card, footer, dark-mode block and
 * Outlook workarounds. Hand-maintaining thirteen copies guarantees they drift,
 * and a drifted set is worse than an unstyled one: users notice when the
 * password-reset email looks like a different company from the signup email.
 *
 * Colours are the live brand tokens from docs/brand/colors.md, converted from
 * OKLCH to hex because email clients have no OKLCH support. `--primary` is
 * espresso, not copper — copper is a fill/hover surface and a link colour. The
 * brand guide also requires teal stay present as a secondary signal rather than
 * the palette going one-note brown, so it marks security and expiry notes.
 *
 * Run: node scripts/generate-email-templates.mjs
 * Out: docs/email-templates/*.html
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "email-templates");

const C = {
  page: "#fff7eb", // --background, ivory
  card: "#fffdf6", // --card
  ink: "#1f130b", // --foreground, espresso
  inkSoft: "#5d4f45", // --muted-foreground
  border: "#ddcfbc", // --border
  primary: "#2c1b0f", // --primary, espresso action
  onPrimary: "#fcfcfc", // --primary-foreground
  link: "#a5612e", // --ring, copper
  teal: "#006a77", // --accent2, status/connection cue
  darkPage: "#150b05",
  darkCard: "#221610",
  darkBorder: "#3a2a1e",
  darkInk: "#f6f1e9",
  darkInkSoft: "#c9bcb0",
  darkBtn: "#f0b27a",
};

const DISPLAY = `'Space Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`;
const BODY = `-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif`;
const MONO = `'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace`;

const SITE = "https://melanatedintech.com";
const LOGO = `${SITE}/brand/mit-logo-horizontal.png`;

/** Hidden inbox-preview line. Without it clients scrape the logo alt text. */
const preheaderBlock = (text) => `
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${text}
    ${"&#8203;&nbsp;".repeat(12)}
  </div>`;

/**
 * Bulletproof button. Outlook desktop drops padding on <a>, so the VML
 * roundrect carries the shape there and the table version serves everyone else.
 */
const button = (label, href) => `
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                      href="${href}" style="height:46px;v-text-anchor:middle;width:250px;" arcsize="18%" stroke="f" fillcolor="${C.primary}">
                      <w:anchorlock/>
                      <center style="color:${C.onPrimary};font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;">${label}</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-- -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="btn" bgcolor="${C.primary}" style="background-color:${C.primary};border-radius:8px;">
                          <a href="${href}" style="display:inline-block;padding:13px 26px;font-family:${BODY};font-size:15px;font-weight:600;line-height:20px;color:${C.onPrimary};text-decoration:none;border-radius:8px;">${label}</a>
                        </td>
                      </tr>
                    </table>
                    <!--<![endif]-->`;

/** Teal-ruled aside. Used for expiry and security guidance, never decoration. */
const aside = (html) => `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-left:3px solid ${C.teal};padding:2px 0 2px 12px;">
                          <p class="ink-soft" style="margin:0;font-family:${BODY};font-size:13px;line-height:20px;color:${C.inkSoft};">${html}</p>
                        </td>
                      </tr>
                    </table>`;

/** Large monospace one-time code, for the OTP-bearing templates. */
const codeBlock = (token) => `
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="code" style="background-color:#f5e9d9;border:1px solid ${C.border};border-radius:8px;padding:14px 22px;font-family:${MONO};font-size:26px;letter-spacing:5px;font-weight:600;color:${C.ink};">${token}</td>
                      </tr>
                    </table>`;

/** Plain URL escape hatch: scanners and text-only clients strip buttons. */
const urlFallback = (href) => `
                <tr>
                  <td class="px rule" style="padding:18px 28px 24px;border-top:1px solid ${C.border};">
                    <p class="ink-soft" style="margin:0 0 6px;font-family:${BODY};font-size:12px;line-height:18px;color:${C.inkSoft};">Button not working? Paste this into your browser:</p>
                    <p style="margin:0;font-family:${MONO};font-size:12px;line-height:18px;word-break:break-all;">
                      <a href="${href}" style="color:${C.link};text-decoration:underline;">${href}</a>
                    </p>
                  </td>
                </tr>`;

/** Label/value rows describing exactly what changed, for the notice emails. */
const facts = (rows) => `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.border};border-radius:8px;">
                      ${rows
                        .map(
                          ([k, v], i) => `<tr>
                        <td class="rule" style="padding:10px 14px;${i ? `border-top:1px solid ${C.border};` : ""}font-family:${BODY};font-size:13px;line-height:19px;color:${C.inkSoft};width:40%;">${k}</td>
                        <td class="rule ink" style="padding:10px 14px;${i ? `border-top:1px solid ${C.border};` : ""}font-family:${MONO};font-size:13px;line-height:19px;color:${C.ink};word-break:break-all;">${v}</td>
                      </tr>`,
                        )
                        .join("\n                      ")}
                    </table>`;

function shell({ title, preheader, inner, footerNote }) {
  return `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${title} — Melanated In Tech</title>
<!--[if mso]>
<xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
<style>
  body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table { border-collapse:collapse !important; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  a { color:${C.link}; }
  @media only screen and (max-width:600px) {
    .container { width:100% !important; }
    .px { padding-left:20px !important; padding-right:20px !important; }
    .h1 { font-size:22px !important; line-height:29px !important; }
    .code { font-size:22px !important; letter-spacing:4px !important; }
  }
  @media (prefers-color-scheme: dark) {
    .bg { background-color:${C.darkPage} !important; }
    .card { background-color:${C.darkCard} !important; border-color:${C.darkBorder} !important; }
    .ink { color:${C.darkInk} !important; }
    .ink-soft { color:${C.darkInkSoft} !important; }
    .btn { background-color:${C.darkBtn} !important; }
    .btn a { color:${C.darkPage} !important; }
    .rule { border-color:${C.darkBorder} !important; }
    .code { background-color:#2e1f16 !important; border-color:${C.darkBorder} !important; color:${C.darkInk} !important; }
  }
</style>
</head>
<body class="bg" style="margin:0;padding:0;background-color:${C.page};">
${preheaderBlock(preheader)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background-color:${C.page};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;">
          <tr>
            <td class="px" style="padding:0 8px 20px;">
              <a href="${SITE}" style="text-decoration:none;">
                <img src="${LOGO}" width="176" height="36" alt="Melanated In Tech" style="display:block;width:176px;height:36px;border:0;">
              </a>
            </td>
          </tr>
          <tr>
            <td class="card" style="background-color:${C.card};border:1px solid ${C.border};border-radius:14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${inner}
              </table>
            </td>
          </tr>
          <tr>
            <td class="px" style="padding:22px 8px 0;">
              <p class="ink-soft" style="margin:0 0 6px;font-family:${BODY};font-size:12px;line-height:19px;color:${C.inkSoft};">${footerNote}</p>
              <p class="ink-soft" style="margin:0;font-family:${BODY};font-size:12px;line-height:19px;color:${C.inkSoft};">
                Melanated In Tech · Sebring, Florida · <a href="${SITE}" style="color:${C.link};text-decoration:underline;">melanatedintech.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

const head = (heading, lede) => `                <tr>
                  <td class="px" style="padding:32px 28px 8px;">
                    <h1 class="h1 ink" style="margin:0 0 14px;font-family:${DISPLAY};font-size:24px;line-height:31px;font-weight:600;color:${C.ink};letter-spacing:-0.01em;">${heading}</h1>
                    <p class="ink-soft" style="margin:0 0 22px;font-family:${BODY};font-size:15px;line-height:24px;color:${C.inkSoft};">${lede}</p>
                  </td>
                </tr>`;

const block = (html, pad = "0 28px 22px") => `                <tr>
                  <td class="px" style="padding:${pad};">${html}
                  </td>
                </tr>`;

/** An email that asks the reader to do something. */
function actionTemplate({ heading, lede, cta, url, note, extra }) {
  return [
    head(heading, lede),
    extra ? block(extra) : "",
    block(button(cta, url)),
    note ? block(aside(note), "0 28px 28px") : "",
    urlFallback(url),
  ]
    .filter(Boolean)
    .join("\n");
}

/** An email that reports something that already happened. */
function noticeTemplate({ heading, lede, rows, action }) {
  return [head(heading, lede), rows ? block(facts(rows)) : "", block(aside(action), "0 28px 28px")]
    .filter(Boolean)
    .join("\n");
}

const IGNORE_ACTION = `If this wasn't you, <a href="${SITE}/contact" style="color:${C.link};text-decoration:underline;">contact us</a> straight away and change your password.`;
const NOT_YOU = "If you didn't request this, you can ignore this email — nothing changes until the link above is used.";

const TEMPLATES = [
  // ---- Authentication -----------------------------------------------------
  {
    file: "01-confirm-signup",
    label: "Confirm sign up",
    title: "Confirm your email",
    preheader: "Confirm your email to activate your Melanated In Tech account. The link expires in 24 hours.",
    footerNote:
      "You received this because someone used this address to create a Melanated In Tech account. If that wasn't you, ignore this email — no account is created until the link above is used.",
    inner: actionTemplate({
      heading: "Confirm your email",
      lede: "Welcome to Melanated In Tech. Confirm this address to activate your account and get into the agent marketplace, the knowledge hub, and the tools workbench.",
      cta: "Confirm my email",
      url: "{{ .ConfirmationURL }}",
      note: "This link expires in 24&nbsp;hours and can only be used once.",
    }),
  },
  {
    file: "02-invite-user",
    label: "Invite user",
    title: "You're invited",
    preheader: "You've been invited to Melanated In Tech. Accept to set up your account.",
    footerNote:
      "You received this because someone invited this address to Melanated In Tech. If you weren't expecting it, you can ignore this email.",
    inner: actionTemplate({
      heading: "You've been invited",
      lede: "Someone at Melanated In Tech invited you to join. Accept the invitation to set your password and get access to the marketplace, knowledge hub, and tools.",
      cta: "Accept the invitation",
      url: "{{ .ConfirmationURL }}",
      note: "This invitation expires in 24&nbsp;hours.",
    }),
  },
  {
    file: "03-magic-link",
    label: "Magic link or OTP",
    title: "Your sign-in link",
    preheader: "Your one-time sign-in link for Melanated In Tech. Expires in 60 minutes.",
    footerNote:
      "You received this because someone asked to sign in with this address. If that wasn't you, ignore this email — the link is useless without access to this inbox.",
    inner: actionTemplate({
      heading: "Sign in to Melanated In Tech",
      lede: "Use the button below to sign in. No password needed.",
      cta: "Sign me in",
      url: "{{ .ConfirmationURL }}",
      note: "This link expires in 60&nbsp;minutes and can only be used once. Prefer a code? Use <strong style=\"color:inherit;\">{{ .Token }}</strong>.",
    }),
  },
  {
    file: "04-change-email",
    label: "Change email address",
    title: "Confirm your new email",
    preheader: "Confirm your new email address for Melanated In Tech.",
    footerNote:
      "You received this because someone asked to move a Melanated In Tech account to this address. If that wasn't you, ignore this email — the address is not changed until the link above is used.",
    inner: actionTemplate({
      heading: "Confirm your new email",
      lede: "You asked to change the email on your Melanated In Tech account. Confirm this address to finish the switch — your old address keeps working until you do.",
      cta: "Confirm new email",
      url: "{{ .ConfirmationURL }}",
      note: "This link expires in 24&nbsp;hours. Until then, sign in with your current address.",
      extra: facts([["New address", "{{ .NewEmail }}"]]),
    }),
  },
  {
    file: "05-reset-password",
    label: "Reset password",
    title: "Reset your password",
    preheader: "Reset your Melanated In Tech password. The link expires in 60 minutes.",
    footerNote:
      "You received this because someone asked to reset the password for this address. If that wasn't you, ignore this email — your password stays as it is.",
    inner: actionTemplate({
      heading: "Reset your password",
      lede: "Choose a new password for your Melanated In Tech account. Your current password keeps working until you set a new one.",
      cta: "Set a new password",
      url: "{{ .ConfirmationURL }}",
      note: "This link expires in 60&nbsp;minutes and can only be used once.",
    }),
  },
  {
    file: "06-reauthentication",
    label: "Reauthentication",
    title: "Your verification code",
    preheader: "Your Melanated In Tech verification code. Expires in 10 minutes.",
    footerNote:
      "You received this because a sensitive action was attempted on your account. If that wasn't you, change your password immediately.",
    inner: [
      head(
        "Confirm it's you",
        "Enter this code to confirm a sensitive change on your Melanated In Tech account.",
      ),
      block(codeBlock("{{ .Token }}")),
      block(
        aside(
          `This code expires in 10&nbsp;minutes. We will never ask you for it by phone, chat, or email reply.`,
        ),
        "0 28px 28px",
      ),
    ].join("\n"),
  },

  // ---- Security notifications --------------------------------------------
  {
    file: "07-password-changed",
    label: "Password changed",
    title: "Your password was changed",
    preheader: "The password on your Melanated In Tech account was just changed.",
    footerNote: "This is a security notification. We send it every time an account password changes.",
    inner: noticeTemplate({
      heading: "Your password was changed",
      lede: "The password on your Melanated In Tech account has been updated. You'll need the new password next time you sign in.",
      rows: [["Account", "{{ .Email }}"]],
      action: IGNORE_ACTION,
    }),
  },
  {
    file: "08-email-changed",
    label: "Email address changed",
    title: "Your email address was changed",
    preheader: "The email address on your Melanated In Tech account was just changed.",
    footerNote: "This is a security notification, sent to both the old and new addresses.",
    inner: noticeTemplate({
      heading: "Your email address was changed",
      lede: "The address on your Melanated In Tech account has been updated. Sign in with the new address from now on.",
      rows: [
        ["Previous address", "{{ .OldEmail }}"],
        ["New address", "{{ .Email }}"],
      ],
      action: IGNORE_ACTION,
    }),
  },
  {
    file: "09-phone-changed",
    label: "Phone number changed",
    title: "Your phone number was changed",
    preheader: "The phone number on your Melanated In Tech account was just changed.",
    footerNote: "This is a security notification. We send it every time an account phone number changes.",
    inner: noticeTemplate({
      heading: "Your phone number was changed",
      lede: "The phone number on your Melanated In Tech account has been updated.",
      rows: [
        ["Previous number", "{{ .OldPhone }}"],
        ["New number", "{{ .Phone }}"],
      ],
      action: IGNORE_ACTION,
    }),
  },
  {
    file: "10-signin-method-linked",
    label: "Sign-in method linked",
    title: "A sign-in method was added",
    preheader: "A new way to sign in was added to your Melanated In Tech account.",
    footerNote: "This is a security notification. We send it whenever a sign-in method is added.",
    inner: noticeTemplate({
      heading: "A new sign-in method was added",
      lede: "Your Melanated In Tech account can now be accessed with an additional sign-in method.",
      rows: [
        ["Method", "{{ .Provider }}"],
        ["Account", "{{ .Email }}"],
      ],
      action: IGNORE_ACTION,
    }),
  },
  {
    file: "11-signin-method-removed",
    label: "Sign-in method removed",
    title: "A sign-in method was removed",
    preheader: "A way to sign in was removed from your Melanated In Tech account.",
    footerNote: "This is a security notification. We send it whenever a sign-in method is removed.",
    inner: noticeTemplate({
      heading: "A sign-in method was removed",
      lede: "That method can no longer be used to reach your Melanated In Tech account. Make sure you still have a way in before you need one.",
      rows: [
        ["Method", "{{ .Provider }}"],
        ["Account", "{{ .Email }}"],
      ],
      action: IGNORE_ACTION,
    }),
  },
  {
    file: "12-mfa-added",
    label: "Verification method added (MFA)",
    title: "Two-factor was added",
    preheader: "A two-factor verification method was added to your Melanated In Tech account.",
    footerNote: "This is a security notification. We send it whenever a verification method is added.",
    inner: noticeTemplate({
      heading: "Two-factor verification was added",
      lede: "Your Melanated In Tech account now asks for a second factor at sign-in. Keep your recovery options somewhere safe.",
      rows: [
        ["Method", "{{ .FactorType }}"],
        ["Account", "{{ .Email }}"],
      ],
      action: IGNORE_ACTION,
    }),
  },
  {
    file: "13-mfa-removed",
    label: "Verification method removed (MFA)",
    title: "Two-factor was removed",
    preheader: "A two-factor verification method was removed from your Melanated In Tech account.",
    footerNote: "This is a security notification. We send it whenever a verification method is removed.",
    inner: noticeTemplate({
      heading: "Two-factor verification was removed",
      lede: "Your Melanated In Tech account no longer asks for this second factor at sign-in, which makes it easier to reach with a password alone.",
      rows: [
        ["Method", "{{ .FactorType }}"],
        ["Account", "{{ .Email }}"],
      ],
      action: IGNORE_ACTION,
    }),
  },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const t of TEMPLATES) {
  writeFileSync(join(OUT_DIR, `${t.file}.html`), shell(t), "utf8");
}
// Suppress the unused-warning for a constant kept for future action templates.
void NOT_YOU;
console.log(`Wrote ${TEMPLATES.length} templates to docs/email-templates/`);
for (const t of TEMPLATES) console.log(`  ${t.file}.html  ->  ${t.label}`);
