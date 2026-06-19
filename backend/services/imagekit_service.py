from imagekitio import ImageKit
from dotenv import load_dotenv
import os
import base64

load_dotenv()

imagekit = ImageKit(
    private_key=os.getenv(
        "IMAGEKIT_PRIVATE_KEY"
    ),
    public_key=os.getenv(
        "IMAGEKIT_PUBLIC_KEY"
    ),
    url_endpoint=os.getenv(
        "IMAGEKIT_URL_ENDPOINT"
    ),
)


def upload_audio(
    file_path: str,
):
    with open(
        file_path,
        "rb",
    ) as f:
        encoded = (
            base64.b64encode(
                f.read()
            ).decode()
        )

    response = imagekit.upload_file(
        file=encoded,
        file_name=os.path.basename(
            file_path
        ),
        options={
            "folder":
            "/recordings"
        },
    )

    return response.url