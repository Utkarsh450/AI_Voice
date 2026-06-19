from groq import AsyncGroq
import os

client = AsyncGroq(
    api_key=os.getenv(
        "GROQ_API_KEY"
    )
)


async def generate_summary(
    messages,
):
    conversation = "\n".join(
        [
            f"{m.speaker}: {m.content}"
            for m in messages
        ]
    )

    prompt = f"""
You are creating memory for an AI voice assistant.

Generate:

1. Detailed Summary
- Topics discussed
- Questions asked
- Answers given
- Decisions made
- Important context

2. Important User Facts
- Preferences
- Goals
- Interests
- Personal information shared

3. Open Questions
- Things user may ask later

4. Action Items

Return EXACTLY in this format:

SUMMARY:
...

USER_FACTS:
...

OPEN_ITEMS:
...

ACTION_ITEMS:
...
"""

    response = (
        await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": prompt,
                },
                {
                    "role": "user",
                    "content": conversation,
                },
            ],
            temperature=0.3,
        )
    )

    summary = (
        response
        .choices[0]
        .message
        .content
    )

    print(
        "SUMMARY RESPONSE:",
        summary
    )

    return summary


def parse_summary(text):
    result = {
        "summary": "",
        "user_facts": "",
        "open_items": "",
        "action_items": "",
    }

    try:
        if "SUMMARY:" in text:
            result["summary"] = (
                text.split(
                    "SUMMARY:"
                )[1]
                .split(
                    "USER_FACTS:"
                )[0]
                .strip()
            )

        if "USER_FACTS:" in text:
            result["user_facts"] = (
                text.split(
                    "USER_FACTS:"
                )[1]
                .split(
                    "OPEN_ITEMS:"
                )[0]
                .strip()
            )

        if "OPEN_ITEMS:" in text:
            result["open_items"] = (
                text.split(
                    "OPEN_ITEMS:"
                )[1]
                .split(
                    "ACTION_ITEMS:"
                )[0]
                .strip()
            )

        if "ACTION_ITEMS:" in text:
            result["action_items"] = (
                text.split(
                    "ACTION_ITEMS:"
                )[1]
                .strip()
            )

    except Exception as e:
        print(
            "Summary parse error:",
            e
        )

    return result