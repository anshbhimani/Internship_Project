import aiosmtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
from fastapi import HTTPException
import os

# Load environment variables
load_dotenv()
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

# Common email sending function
async def send_email(recipient_email, subject, body):
    """ Sends an email with the given subject and body. """
    if not recipient_email:
        raise HTTPException(status_code=400, detail="Recipient email not provided")

    msg = MIMEText(body, "html")
    msg['Subject'] = subject
    msg['From'] = GMAIL_USER
    msg['To'] = recipient_email

    try:
        print("Connecting to SMTP server...")
        server = aiosmtplib.SMTP(hostname=SMTP_SERVER, port=SMTP_PORT,use_tls=True)
        await server.connect()

        await server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        await server.sendmail(GMAIL_USER, recipient_email, msg.as_string())
        await server.quit()
        print(f"Email sent successfully to {recipient_email}!")
    except Exception as e:
        print(f"Failed to send email to {recipient_email}: {e}")

# Function to generate a styled HTML email
def generate_email_body(title, user_name, message):
    """ Generates an HTML email with styling. """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: auto;
                background: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            }}
            h2 {{
                color: #333;
                text-align: center;
            }}
            p {{
                font-size: 16px;
                color: #555;
                line-height: 1.5;
            }}
            .highlight {{
                font-size: 18px;
                font-weight: bold;
                color: #007bff;
            }}
            .footer {{
                margin-top: 20px;
                text-align: center;
                font-size: 14px;
                color: #777;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>{title}</h2>
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>{message}</p>
            <p class="footer">Regards,<br>Project Management Team</p>
        </div>
    </body>
    </html>
    """

# --- Developer Assignment ---
async def send_developer_assigned_email(developer, project, manager_email):
    """ Sends an email to a developer and manager when a developer is assigned. """
    dev_email = developer.get("email")
    dev_name = developer.get("firstname", "Developer")
    proj_name = project.get("name", "Unknown Project")

    # Email for Developer
    subject_dev = "Project Assignment Notification"
    message_dev = f"You have been assigned to the project: <span class='highlight'>{proj_name}</span>."
    body_dev = generate_email_body("Project Assigned", dev_name, message_dev)
    await send_email(dev_email, subject_dev, body_dev)

    # Email for Manager
    subject_mgr = "Developer Assigned to Project"
    message_mgr = f"{dev_name} has been assigned to the project: <span class='highlight'>{proj_name}</span>."
    body_mgr = generate_email_body("Developer Assigned", "Manager", message_mgr)
    await send_email(manager_email, subject_mgr, body_mgr)

# --- Developer Deassignment ---
async def send_developer_deassigned_email(developer, project, manager_email):
    """ Sends an email to a developer and manager when a developer is removed. """
    dev_email = developer.get("email")
    dev_name = developer.get("firstname", "Developer")
    proj_name = project.get("name", "Unknown Project")

    # Email for Developer
    subject_dev = "Project Removal Notification"
    message_dev = f"You have been removed from the project: <span class='highlight'>{proj_name}</span>."
    body_dev = generate_email_body("Project Removal", dev_name, message_dev)
    await send_email(dev_email, subject_dev, body_dev)

    # Email for Manager
    subject_mgr = "Developer Removed from Project"
    message_mgr = f"{dev_name} has been removed from the project: <span class='highlight'>{proj_name}</span>."
    body_mgr = generate_email_body("Developer Removed", "Manager", message_mgr)
    await send_email(manager_email, subject_mgr, body_mgr)

# --- Manager Assignment ---
async def send_manager_assignment_email(manager, project):
    """ Sends an email to a manager when assigned to a project. """
    mgr_email = manager.get("email")
    mgr_name = manager.get("firstname", "Manager")
    proj_name = project.get("name", "Unknown Project")

    subject = "Project Assignment Notification"
    message = f"You have been assigned as the manager for the project: <span class='highlight'>{proj_name}</span>."
    body = generate_email_body("Project Manager Assigned", mgr_name, message)
    await send_email(mgr_email, subject, body)

# --- Manager Deassignment ---
async def send_manager_removal_email(manager, project):
    """ Sends an email to a manager when removed from a project. """
    mgr_email = manager.get("email")
    mgr_name = manager.get("firstname", "Manager")
    proj_name = project.get("name", "Unknown Project")

    subject = "Project Removal Notification"
    message = f"You have been removed as the manager from the project: <span class='highlight'>{proj_name}</span>."
    body = generate_email_body("Project Manager Removed", mgr_name, message)
    await send_email(mgr_email, subject, body)

# --- Task Assignment ---
async def send_task_assignment_email(user, task):
    """ Sends an email to notify a user about a task assignment. """
    user_email = user.get("email")
    user_name = user.get("firstname", "User")
    task_title = task.get("title", "Unnamed Task")

    subject = "Task Assignment Notification"
    message = f"You have been assigned a new task: <span class='highlight'>{task_title}</span>."
    body = generate_email_body("Task Assigned", user_name, message)
    await send_email(user_email, subject, body)

# --- Task Deassignment ---
async def send_task_removal_email(user, task):
    """ Sends an email to notify a user about task removal. """
    user_email = user.get("email")
    user_name = user.get("firstname", "User")
    task_title = task.get("title", "Unnamed Task")

    subject = "Task Removal Notification"
    message = f"You have been removed from the task: <span class='highlight'>{task_title}</span>."
    body = generate_email_body("Task Removed", user_name, message)
    await send_email(user_email, subject, body)
