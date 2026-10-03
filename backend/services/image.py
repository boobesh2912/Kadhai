"""Illustration generation with a Gemini image model."""
import base64

from .. import config
from ..errors import ApiError
from ..gemini import interact


def build_image_prompt(title, story_type, tone):
    return (
        f"A colorful, detailed storybook illustration for a {story_type} story titled "
        f"'{title}', with a {tone} mood. No text or letters in the image."
    )


def generate_image(title, story_type, tone):
    """Return (image_bytes, content_type)."""
    interaction = interact(
        model=config.image_model(),
        input=build_image_prompt(title, story_type, tone),
        response_modalities=["image"],
    )
    image = interaction.output_image
    if image is None or not image.data:
        raise ApiError("The image model did not return an image. Please try again.", "empty_image", 502)
    return base64.b64decode(image.data), image.mime_type or "image/png"
