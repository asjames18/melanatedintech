# Supabase auth email templates

Thirteen branded templates covering every email Supabase Auth sends.

**Do not edit these files.** They are generated. Edit
`scripts/generate-email-templates.mjs` and re-run:

```bash
npm run generate:emails
```

The shell — masthead, card, footer, dark mode, Outlook workarounds — lives once
in the generator. Thirteen hand-maintained copies drift, and a drifted set is
worse than an unstyled one: people notice when the password-reset email looks
like a different company from the signup email.

## Installing

Supabase does not expose email templates through the CLI or the database, so
these are pasted by hand once each:

**Dashboard → Authentication → Emails**, then open each template and replace
the body.

| Dashboard template | File |
|---|---|
| Confirm sign up | `01-confirm-signup.html` |
| Invite user | `02-invite-user.html` |
| Magic link or OTP | `03-magic-link.html` |
| Change email address | `04-change-email.html` |
| Reset password | `05-reset-password.html` |
| Reauthentication | `06-reauthentication.html` |
| Password changed | `07-password-changed.html` |
| Email address changed | `08-email-changed.html` |
| Phone number changed | `09-phone-changed.html` |
| Sign-in method linked | `10-signin-method-linked.html` |
| Sign-in method removed | `11-signin-method-removed.html` |
| MFA method added | `12-mfa-added.html` |
| MFA method removed | `13-mfa-removed.html` |

## Subject lines

Set in the same screen, above the body. Supabase's defaults ("Confirm Your
Signup") undercut a branded body, so replace them too.

| Template | Subject |
|---|---|
| Confirm sign up | Confirm your email |
| Invite user | You're invited to Melanated In Tech |
| Magic link or OTP | Your sign-in link |
| Change email address | Confirm your new email address |
| Reset password | Reset your password |
| Reauthentication | `{{ .Token }}` is your verification code |
| Password changed | Your password was changed |
| Email address changed | Your email address was changed |
| Phone number changed | Your phone number was changed |
| Sign-in method linked | A sign-in method was added to your account |
| Sign-in method removed | A sign-in method was removed from your account |
| MFA method added | Two-factor verification was added |
| MFA method removed | Two-factor verification was removed |

Two deliberate choices there.

**The reauthentication subject leads with the code.** Subject fields take the
same variables as the body, so the code lands in the lock-screen notification
and the inbox list — most people never open the email. Do this only for the
short-lived reauthentication code, never for a link.

**The security subjects state what happened, in the past tense, with no brand
name in front.** Someone scanning an inbox for "did my account just get taken
over?" needs the fact first. A subject reading "Melanated In Tech: Security
Notification" buries it.

## Variables used

Each template uses only the variables Supabase provides for it. Using one that
is not available renders the literal `{{ .Whatever }}` to the reader.

| File | Variables |
|---|---|
| 01 confirm signup | `.ConfirmationURL` |
| 02 invite user | `.ConfirmationURL` |
| 03 magic link | `.ConfirmationURL`, `.Token` |
| 04 change email | `.ConfirmationURL`, `.NewEmail` |
| 05 reset password | `.ConfirmationURL` |
| 06 reauthentication | `.Token` (no URL — this one is code-only) |
| 07 password changed | `.Email` |
| 08 email changed | `.OldEmail`, `.Email` |
| 09 phone changed | `.OldPhone`, `.Phone` |
| 10 sign-in linked | `.Provider`, `.Email` |
| 11 sign-in removed | `.Provider`, `.Email` |
| 12 MFA added | `.FactorType`, `.Email` |
| 13 MFA removed | `.FactorType`, `.Email` |

## Why the markup looks the way it does

Email clients are not browsers. Each of these is load-bearing:

- **Table layout, not divs.** Outlook desktop uses Word's engine and ignores
  `max-width` on a `<div>`, rendering the email edge to edge.
- **VML button.** Outlook drops `padding` on `<a>`, collapsing a styled button
  into a bare link. The `<!--[if mso]>` roundrect carries the shape there.
- **Preheader.** The hidden first line controls the inbox preview. Without it
  clients scrape whatever text comes first, which is the logo's alt text.
- **Plain URL fallback.** Corporate scanners and text-only clients strip
  buttons; without the visible link the email is a dead end.
- **`color-scheme` meta + `prefers-color-scheme` block.** Otherwise dark-mode
  clients auto-invert, which goes badly on a cream background.

## Colour

Values are the live brand tokens from `docs/brand/colors.md`, converted from
OKLCH to hex because no email client supports OKLCH. Two things to preserve if
you edit them:

- `--primary` is **espresso** `#2c1b0f`, not copper. Copper `#a5612e` is the
  link and ring colour, not the button.
- Teal `#006a77` stays present as the status cue on security and expiry notes.
  The brand guide is explicit that the palette should not go one-note brown.
