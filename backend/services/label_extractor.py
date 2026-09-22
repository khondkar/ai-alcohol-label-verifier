import base64
import json
from openai import OpenAI


client = OpenAI()


def extract_label_fields(image_bytes: bytes, content_type: str) -> dict:
    """
    Extract compliance-relevant fields from an alcohol label image.
    """

    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    response = client.responses.create(
        model="gpt-5.4-mini",
        input=[
            {
                "role": "system",
                "content": (
                    "You extract information from alcohol beverage labels. "
                    "Only report information visible on the label. "
                    "Do not guess missing information."
                ),
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": """
Extract these fields from this alcohol beverage label:

- brand_name
- class_type
- alcohol_content
- net_contents
- producer_name_address
- country_of_origin
- government_warning

Return ONLY valid JSON using exactly these keys.

If a field is not visible or cannot be determined,
return null for that field.

Do not infer or invent missing information.
""",
                    },
                    {
                        "type": "input_image",
                        "image_url": (
                            f"data:{content_type};base64,{encoded_image}"
                        ),
                    },
                ],
            },
        ],
    )

    text = response.output_text.strip()

    # Handle JSON returned inside a Markdown code fence.
    if text.startswith("```"):
        text = text.removeprefix("```json")
        text = text.removeprefix("```")
        text = text.removesuffix("```").strip()

    return json.loads(text)