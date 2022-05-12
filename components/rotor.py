from config.config import ALPHABET, Wiring
from config.pygame_config import (
    COMPONENT_BORDER_RADIUS,
    COMPONENT_LETTERS_COLOR,
    COMPONENT_BORDER_COLOR,
    COMPONENT_BORDER_WIDTH,
    ROTOR_FIRST_LETTER_COLOR,
    BACKGROUND,
    ROTOR_FIRST_LETTER_BORDER_RADIUS,
)

import pygame


class Rotor:
    def __init__(self, wiring: Wiring, notch: str, name: str) -> None:
        self.left = ALPHABET
        self.right = wiring.wiring
        self.notch = notch
        self.name = name

    def get_value_left(self, n: int) -> str:
        return self.left[n]

    def get_value_right(self, n: int) -> str:
        return self.right[n]

    def forward(self, signal: int) -> int:
        letter = self.right[signal]
        return self.left.find(letter)

    def backward(self, signal: int) -> int:
        letter = self.left[signal]
        return self.right.find(letter)

    def show_rotor(self) -> None:
        print("Showing Rotor")
        print(self.left)
        print(self.right)

    def rotate(self, num_of_rotations: int = 1, rotate_forward: bool = True) -> None:
        for _ in range(num_of_rotations):
            if rotate_forward:
                self.left = self.left[1:] + self.left[0]
                self.right = self.right[1:] + self.right[0]
            else:
                self.left = self.left[25] + self.left[:25]
                self.right = self.right[25] + self.right[:25]

    def rotate_to_letter(self, letter: str) -> None:
        n = ALPHABET.find(letter)
        self.rotate(num_of_rotations=n)

    def set_ring(self, ring: int) -> None:
        # rotate backwards first (index =1)
        self.rotate(num_of_rotations=ring, rotate_forward=False)

        # adjust turnover notch in relation to the wiring
        n_notch = ALPHABET.find(self.notch)
        self.notch = ALPHABET[(n_notch - ring) % len(ALPHABET)]

    def draw(self, screen: pygame.surface.Surface, x: int, y: int, w: int, h: int, font: pygame.font.Font):
        r = pygame.Rect(x, y, w, h)
        pygame.draw.rect(screen, COMPONENT_BORDER_COLOR, r, width=COMPONENT_BORDER_WIDTH, border_radius=COMPONENT_BORDER_RADIUS)
        for i in range(len(ALPHABET)):
            letter = font.render(self.left[i], True, COMPONENT_LETTERS_COLOR)
            text_box = letter.get_rect(center=(x + w / 4, y + (i + 1) * h / 27))

            if i == 0:
                pygame.draw.rect(screen, ROTOR_FIRST_LETTER_COLOR, text_box, ROTOR_FIRST_LETTER_BORDER_RADIUS)

            if self.get_value_left(i) == self.notch:
                letter = font.render(self.notch, True, BACKGROUND)
                pygame.draw.rect(screen, "white", text_box, 0)

            screen.blit(letter, text_box)

            letter = font.render(self.right[i], True, COMPONENT_LETTERS_COLOR)
            text_box = letter.get_rect(center=(x + w * 3 / 4, y + (i + 1) * h / 27))
            screen.blit(letter, text_box)
