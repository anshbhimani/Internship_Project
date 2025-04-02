import cloudinary
from cloudinary.uploader import upload
from dotenv import load_dotenv
import os

load_dotenv()

#cloundinary configuration
cloudinary.config(
    cloud_name = os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)

#util functionn...

async def upload_image(image):
    result = upload(image)
    print("cloundianry response,",result)
    return result["secure_url"] #string