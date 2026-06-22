import os
from huggingface_hub import HfApi, create_repo
from dotenv import load_dotenv, dotenv_values

# Load .env variables
load_dotenv("backend/.env")

# Initialize HF API with the user's token
token = os.getenv("HF_TOKEN")
if not token:
    raise ValueError("HF_TOKEN environment variable not found in .env")
api = HfApi(token=token)

repo_id = "aaa500/ai-voice-agent"

print(f"Creating or retrieving repository: {repo_id}")
try:
    create_repo(repo_id=repo_id, repo_type="space", space_sdk="docker", private=True, token=token)
    print("Space created successfully.")
except Exception as e:
    print(f"Space might already exist or error: {e}")

# Load .env variables
print("Loading environment variables from .env...")
env_vars = dotenv_values("backend/.env")

print("Setting secrets in Hugging Face Space...")
for key, value in env_vars.items():
    if value:
        try:
            api.add_space_secret(repo_id=repo_id, key=key, value=str(value))
        except Exception as e:
            print(f"Failed to set secret {key}: {e}")

print("Uploading files to Hugging Face Space...")
# Ignore unnecessary files
ignore_patterns = [
    "*node_modules*", 
    "*.next*", 
    "*out*", 
    "*.venv*", 
    "*__pycache__*", 
    "*.git*", 
    "*.gemini*", 
    "artifacts*", 
    "deploy_to_hf.py", 
    ".env",
    "*.cache*"
]

try:
    api.upload_folder(
        folder_path=".",
        repo_id=repo_id,
        repo_type="space",
        ignore_patterns=ignore_patterns,
        commit_message="Deploy AI Voice Agent"
    )
    print("Upload complete!")
    print(f"Deploying to: https://huggingface.co/spaces/{repo_id}")
except Exception as e:
    print(f"Error uploading files: {e}")
