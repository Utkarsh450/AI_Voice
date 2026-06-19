from groq import AsyncGroq
import os

client = AsyncGroq(
    api_key=os.getenv(
        "GROQ_API_KEY"
    )
)


async def generate_global_memory(
    previous_memory: str,
    session_summary: str,
):
    response = (
        await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """
You maintain long-term memory.

Update the memory.

Keep only:

- preferences
- goals
- interests
- personal facts
- important context

Remove duplicates.

Return only the updated memory.
""",
                },
                {
                    "role": "user",
                    "content": f"""
Previous Memory:

{previous_memory}

New Session Summary:

{session_summary}
""",
                },
            ],
            temperature=0.2,
        )
    )

    return (
        response
        .choices[0]
        .message
        .content
    )