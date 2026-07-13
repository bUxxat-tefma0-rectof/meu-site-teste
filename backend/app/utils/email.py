import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


def send_email(to_email: str, subject: str, html_content: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_USER
    msg["To"] = to_email

    part = MIMEText(html_content, "html")
    msg.attach(part)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to_email, msg.as_string())


def send_verification_code_email(to_email: str, code: str):
    subject = "Seu código de verificação"
    html = f"""
    <div style="font-family: Arial, sans-serif;">
        <h2>Confirme seu e-mail</h2>
        <p>Seu código de verificação é:</p>
        <h1 style="letter-spacing: 5px;">{code}</h1>
        <p>Este código expira em 10 minutos.</p>
    </div>
    """
    send_email(to_email, subject, html)


def send_password_reset_email(to_email: str, reset_link: str):
    subject = "Recuperação de senha"
    html = f"""
    <div style="font-family: Arial, sans-serif;">
        <h2>Redefinir sua senha</h2>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <a href="{reset_link}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
            Redefinir senha
        </a>
        <p>Este link expira em 30 minutos. Se você não solicitou isso, ignore este e-mail.</p>
    </div>
    """
    send_email(to_email, subject, html)


def send_password_changed_email(to_email: str):
    subject = "Sua senha foi alterada"
    html = """
    <div style="font-family: Arial, sans-serif;">
        <h2>Senha alterada com sucesso</h2>
        <p>Sua senha foi alterada. Se não foi você, entre em contato com o suporte imediatamente.</p>
    </div>
    """
    send_email(to_email, subject, html)
