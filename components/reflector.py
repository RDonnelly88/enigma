from config.config import ALPHABET, Wiring
from config.pygame_config import (
    COMPONENT_BORDER_RADIUS,
    COMPONENT_LETTERS_COLOR,
    COMPONENT_BORDER_COLOR,
    COMPONENT_BORDER_WIDTH,
)
import pygame


class Reflector:
    def __init__(self, wiring: Wiring, name: str) -> None:
        self.left = ALPHABET
        self.right = wiring.wiring
        self.name = name

    def reflect(self, signal: int) -> int:
        letter = self.right[signal]
        return self.left.find(letter)

    def draw(self, screen: pygame.surface.Surface, x: int, y: int, w: int, h: int, font: pygame.font.Font):
        r = pygame.Rect(x, y, w, h)
        pygame.draw.rect(screen, COMPONENT_BORDER_COLOR, r, width=COMPONENT_BORDER_WIDTH, border_radius=COMPONENT_BORDER_RADIUS)
        for i in range(26):
            letter = font.render(self.left[i], True, COMPONENT_LETTERS_COLOR)
            text_box = letter.get_rect(center=(x + w / 4, y + (i + 1) * h / 27))

            screen.blit(letter, text_box)

            letter = font.render(self.right[i], True, COMPONENT_LETTERS_COLOR)
            text_box = letter.get_rect(center=(x + w * 3 / 4, y + (i + 1) * h / 27))
            screen.blit(letter, text_box)
