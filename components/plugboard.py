from typing import List

from config.config import ALPHABET, PlugboardPair
from config.pygame_config import (
    COMPONENT_BORDER_RADIUS,
    COMPONENT_LETTERS_COLOR,
    COMPONENT_BORDER_COLOR,
    COMPONENT_BORDER_WIDTH,
)

import pygame


class Plugboard:
    def __init__(self, plugboard_pairs: List[PlugboardPair], name: str = "Plugboard") -> None:
        self.plugboard_pairs = plugboard_pairs
        self._validate_pairs()
        self.left = ALPHABET
        self.right = ALPHABET
        self.name = name
        for pair in plugboard_pairs:
            pos_a = self.left.find(pair.a)
            pos_b = self.left.find(pair.b)
            self.left = self.left[:pos_a] + pair.b + self.left[pos_a + 1 :]
            self.left = self.left[:pos_b] + pair.a + self.left[pos_b + 1 :]

    def forward(self, signal: int) -> int:
        letter = self.right[signal]
        return self.left.find(letter)

    def backward(self, signal: int) -> int:
        letter = self.left[signal]
        return self.right.find(letter)

    def get_value_left(self, n: int) -> str:
        return self.left[n]

    def get_value_right(self, n: int) -> str:
        return self.right[n]

    def draw(self, screen: pygame.surface.Surface, x: int, y: int, w: int, h: int, font: pygame.font.Font):
        r = pygame.Rect(x, y, w, h)
        pygame.draw.rect(screen, COMPONENT_BORDER_COLOR, r, width=COMPONENT_BORDER_WIDTH, border_radius=COMPONENT_BORDER_RADIUS)
        for i in range(len(ALPHABET)):
            letter = font.render(self.left[i], True, COMPONENT_LETTERS_COLOR)
            text_box = letter.get_rect(center=(x + w / 4, y + (i + 1) * h / 27))

            screen.blit(letter, text_box)

            letter = font.render(self.right[i], True, COMPONENT_LETTERS_COLOR)
            text_box = letter.get_rect(center=(x + w * 3 / 4, y + (i + 1) * h / 27))
            screen.blit(letter, text_box)

    def _validate_pairs(self) -> None:
        vals = []
        for pair in self.plugboard_pairs:
            vals.append(pair.a)
            vals.append(pair.b)
        if len(vals) != len(set(vals)):
            raise ValueError(f"Duplicate value found in Plugboard pairs! {vals}")
