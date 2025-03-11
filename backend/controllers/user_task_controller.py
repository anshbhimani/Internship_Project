from fastapi import HTTPException
from bson import ObjectId
from config.database import db
from models.user_task_model import UserTask
import smtplib
from email.mime.text import MIMEText
from models.user_task_model import UserTask
from dotenv import load_dotenv

import os

load_dotenv()
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587 

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
print(os.getenv("GMAIL_USER"))  # Should print your email
print(os.getenv("GMAIL_APP_PASSWORD"))

async def send_task_assignment_email(user, task):
    """ Sends an email notification when a task is assigned. """
    
    recipient_email = user.get("email")  # Fetch user email
    if not recipient_email:
        raise HTTPException(status_code=400, detail="User email not found")

    recipient_email = str(recipient_email)
    print(f"Sending email to: {recipient_email}")
    # Create Email Message

    body = f"""
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
        .task {{
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
        <h2>New Task Assigned</h2>
        <p>Hello <strong>{user.get('firstname', 'User')}</strong>,</p>
        <p>You have been assigned a new task:</p>
        <p class="task">{task.get('title')}</p>
        <p><strong>Description:</strong> {task.get('description', 'No description available')}</p>
        <p><strong>Deadline:</strong> {task.get('deadline', 'No deadline provided')}</p>
        <p>Please complete the task within the given deadline.</p>
        <p class="footer">Regards,<br>Task Management Team</p>
    </div>
</body>
</html>
"""

    msg = MIMEText(body, "html")

    msg['Subject'] = "New Task Assigned"
    msg['From'] = GMAIL_USER
    msg['To'] = recipient_email

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, recipient_email, msg.as_string())  # ✅ Fix applied
        server.quit()
        print("Email sent successfully!!")
    except Exception as e:
        print(f"Failed to send email: {e}")

# Assign a task to a user
async def assign_task(user_task: UserTask):
    # Ensure user exists
    user = await db["users"].find_one({"_id": ObjectId(user_task.userId)})
    print(user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Ensure task exists
    task = await db["tasks"].find_one({"_id": ObjectId(user_task.taskId)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Insert into user_tasks collection
    result = await db["user_tasks"].insert_one(user_task.dict())
    
    # Send Email Notification
    await send_task_assignment_email(user, task)
    
    print("Email sent successfully!!")
    
    return {"message": "Task assigned successfully", "user_task_id": str(result.inserted_id)}

# Get all tasks assigned to a user
async def get_user_tasks(user_id: str):
    tasks_cursor = db["user_tasks"].find({"userId": user_id})
    tasks = await tasks_cursor.to_list(length=None)

    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found for this user")

    for task in tasks:
        task["_id"] = str(task["_id"])

        # Fetch user details for assigned user
        user = await db["users"].find_one({"_id": ObjectId(task["userId"])})
        if user:
            task["assignedTo"] = f"{user.get('firstname', '')} {user.get('lastname', '')}"  # Full name of the assigned user

    return tasks

# Get all users assigned to a specific task
async def get_users_by_task(task_id: str):
    # Query the user_tasks collection to get users assigned to the task
    user_tasks_cursor = db["user_tasks"].find({"taskId": task_id})
    user_tasks = await user_tasks_cursor.to_list(length=None)

    if not user_tasks:
        raise HTTPException(status_code=404, detail="No users found for this task")

    # For each user_task, get the user details
    users = []
    for user_task in user_tasks:
        user = await db["users"].find_one({"_id": ObjectId(user_task["userId"])})
        if user:
            users.append({
                "user_id": str(user["_id"]),
                "firstname": user.get("firstname"),
                "lastname": user.get("lastname"),
                "full_name": f"{user.get('firstname', '')} {user.get('lastname', '')}"
            })

    if not users:
        raise HTTPException(status_code=404, detail="No users found for this task")

    return users

# Remove a task assignment
async def remove_task_assignment(user_task_id: str):
    result = await db["user_tasks"].delete_one({"_id": ObjectId(user_task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task assignment not found")

    return {"message": "Task assignment removed successfully"}
