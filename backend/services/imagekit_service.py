from imagekitio import ImageKit
from dotenv import load_dotenv
import os
import base64

load_dotenv()

imagekit = ImageKit(
    private_key=os.getenv(
        "IMAGEKIT_PRIVATE_KEY"
    )
)


def upload_audio(file_path: str):
    with open(file_path, "rb") as f:
        response = imagekit.files.upload(
            file=f,
            file_name=os.path.basename(file_path),
            folder="/recordings"
        )

    return response.url

def upload_document(file_path: str):
    with open(file_path, "rb") as f:
        response = imagekit.files.upload(
            file=f,
            file_name=os.path.basename(file_path),
            folder="/documents"
        )

    return response.url