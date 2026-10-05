"""Sends emails through Twilio SendGrid using our own templates (no Firebase/Twilio default content)."""

import html
import requests
from firebase_functions.params import SecretParam, StringParam

SENDGRID_API_KEY = SecretParam(
    "SENDGRID_API_KEY",
    description="Twilio SendGrid API key with Mail Send permission.",
)  # set this via command: firebase functions:secrets:set SENDGRID_API_KEY
FROM_EMAIL = StringParam(
    "FROM_EMAIL",
    default="no-reply@hackncstate.org",
    description="Sender address. Must be a verified sender/domain in SendGrid.",
)
FROM_NAME = StringParam(
    "FROM_NAME",
    default="Hack_NCState",
    description="Sender display name shown in inboxes.",
)
SUPPORT_EMAIL = StringParam(
    "SUPPORT_EMAIL",
    default="team@hackncstate.org",
    description="Contact address shown at the bottom of emails.",
)


def send_email(to: str, subject: str, html_body: str, text_body: str) -> None:
    """Send a single email via the SendGrid v3 API. Raises on failure."""

    response = requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers={
            "Authorization": f"Bearer {SENDGRID_API_KEY.value}",
            "Content-Type": "application/json",
        },
        json={
            "personalizations": [{"to": [{"email": to}]}],
            "from": {"email": FROM_EMAIL.value, "name": FROM_NAME.value},
            "subject": subject,
            # plain text first so clients without html still get the link
            "content": [
                {"type": "text/plain", "value": text_body},
                {"type": "text/html", "value": html_body},
            ],
            # sendgrid rewrites links for click tracking, which breaks one-time sign-in links
            "tracking_settings": {"click_tracking": {"enable": False}},
        },
        timeout=10,
    )
    response.raise_for_status()


def login_link_email(name: str | None, link: str) -> tuple[str, str, str]:
    """Returns (subject, html, text) for the dashboard login email."""

    greeting = f"Hi {name}," if name else "Hi there,"
    subject = "Your Hack_NCState Today login link"

    text = (
        f"{greeting}\n\n"
        "Use the link below to log in to Hack_NCState Today. "
        "It expires in 1 hour and can only be used once.\n\n"
        f"{link}\n\n"
        "If you didn't request this, you can ignore this email.\n\n"
        f"Questions? Contact us at {SUPPORT_EMAIL.value}\n"
        "- Team Hack_NCState"
    )

    safe_link = html.escape(link, quote=True)
    body = f"""\
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;color:#fafafa;font-family:'Courier New',monospace;">
            <tr>
              <td style="font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:bold;padding-bottom:24px;">
                Hack_NCState Today
              </td>
            </tr>
            <tr>
              <td style="font-size:16px;line-height:1.6;padding-bottom:24px;">
                {html.escape(greeting)}<br><br>
                Click the button below to log in to the dashboard.
                This link expires in 1 hour and can only be used once.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:32px;">
                <a href="{safe_link}" style="display:inline-block;background:#e5e5e5;color:#0a0a0a;text-decoration:none;font-family:Arial,sans-serif;font-size:16px;font-weight:600;padding:12px 24px;border-radius:8px;">
                  Log in to Hack_NCState Today
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;line-height:1.6;color:#a3a3a3;">
                Button not working? Paste this link into your browser:<br>
                <a href="{safe_link}" style="color:#a3a3a3;word-break:break-all;">{safe_link}</a><br><br>
                If you didn't request this, you can ignore this email.<br>
                Questions? Contact us at {html.escape(SUPPORT_EMAIL.value)}.<br><br>
                &mdash; Team Hack_NCState
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""
    return subject, body, text
