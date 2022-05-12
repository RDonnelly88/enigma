from config.config import ALPHABET
from config.pygame_config import (
    COMPONENT_BORDER_RADIUS,
    COMPONENT_LETTERS_COLOR,
    COMPONENT_BORDER_COLOR,
    COMPONENT_BORDER_WIDTH,
)
import pygame


class Keyboard:
    def __init__(self, name: str = "Keyboard/Lampboard") -> None:
        self.name = name

    def forward(
        self,
        letter: str,
    ) -> int:
        return ALPHABET.find(letter.upper())

    def backward(self, signal: int) -> str:
        return ALPHABET[signal]

    def draw(self, screen: pygame.surface.Surface, x: int, y: int, w: int, h: int, font: pygame.font.Font):
        r = pygame.Rect(x, y, w, h)
        pygame.draw.rect(screen, COMPONENT_BORDER_COLOR, r, width=COMPONENT_BORDER_WIDTH, border_radius=COMPONENT_BORDER_RADIUS)

        for i in range(26):
            letter = font.render(ALPHABET[i], True, COMPONENT_LETTERS_COLOR)

            text_box = letter.get_rect(center=(x + w / 2, y + (i + 1) * h / 27))
            screen.blit(letter, text_box)
