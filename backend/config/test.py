from database import user_collection
from bson import ObjectId
from database import project_collection

# Sample users
users = [
    {"_id": ObjectId(), "name": "Alice Johnson", "email": "alice@example.com"},
    {"_id": ObjectId(), "name": "Bob Smith", "email": "bob@example.com"},
    {"_id": ObjectId(), "name": "Charlie Brown", "email": "charlie@example.com"}
]

# Insert users
result =  user_collection.insert_many(users)

# Get inserted user IDs
user_ids = [str(user["_id"]) for user in users]
print("Inserted User IDs:", user_ids)


# Sample projects
projects = [
    {
        "title": "Project Tracker",
        "description": "A system to track project progress",
        "technology": "Python FastAPI",
        "estimated_hours": 100,
        "start_date": "2025-03-01",
        "completion_date": "2025-06-01",
        "developers": user_ids[:2]  # Assign first 2 users as developers
    },
    {
        "title": "E-commerce Platform",
        "description": "An online shopping website",
        "technology": "MERN Stack",
        "estimated_hours": 200,
        "start_date": "2025-02-01",
        "completion_date": "2025-07-01",
        "developers": user_ids[1:]  # Assign last 2 users as developers
    }
]

# Insert projects
project_collection.insert_many(projects)

print("Inserted projects successfully!")
