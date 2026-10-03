"""Story text generation with a Gemini text model."""
from .. import config
from ..errors import ApiError
from ..gemini import interact

SYSTEM_PROMPT = (
    "You are a storyteller for kids and creative readers. Write only the story "
    "as plain text in short paragraphs. Do not use markdown, headings, bullet "
    "points or emojis, and do not add notes before or after the story."
)


def build_prompt(title, story_type, length, tone):
    words = config.LENGTH_WORDS[length]
    return (
        f"Create a {length} {story_type} story with a {tone} tone, {words} words long. "
        f"The title is '{title}'."
    )


def generate_story(title, story_type, length, tone):
    interaction = interact(
        model=config.text_model(),
        system_instruction=SYSTEM_PROMPT,
        input=build_prompt(title, story_type, length, tone),
    )
    story = (interaction.output_text or "").strip()
    if not story:
        raise ApiError("The story model returned an empty story. Please try again.", "empty_story", 502)
    return story
