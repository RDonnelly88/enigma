from components.keyboard import Keyboard
from components import historical_rotors
from components import historical_reflectors
from components.plugboard import Plugboard
from config.config import ALPHABET, RotorKey, RotorRings, PlugboardPair
from config.pygame_config import BACKGROUND, WIDTH, HEIGHT, MARGINS, GAP_SIZE, INPUT_COLOR

from enigma import Enigma
from draw import draw
import pygame

pygame.init()
pygame.font.init()
MONO_FONT = pygame.font.SysFont("trebuchetms", 25)

BOLD_FONT = pygame.font.SysFont("trebuchetms", 25, bold=True)

pygame.display.set_caption("Ross' Enigma Machine")

SCREEN = pygame.display.set_mode((WIDTH, HEIGHT))


def main():
    INPUT = ""
    OUTPUT = ""
    ENCRYPTION_PATH = []

    PLUGBOARD = Plugboard([PlugboardPair("A", "B"), PlugboardPair("C", "D"), PlugboardPair("E", "F")])
    KEYBOARD = Keyboard()
    rotor3 = historical_rotors.ROTOR_1
    rotor2 = historical_rotors.ROTOR_2
    rotor1 = historical_rotors.ROTOR_4
    reflector = historical_reflectors.REFLECTOR_B
    ROTOR_RINGS = RotorRings(1, 1, 1)
    ROTOR_KEY = RotorKey("C", "A", "T")
    ENIGMA = Enigma(
        reflector=reflector,
        rotor1=rotor1,
        rotor2=rotor2,
        rotor3=rotor3,
        plugboard=PLUGBOARD,
        keyboard=KEYBOARD,
        rotor_key=ROTOR_KEY,
        rotor_rings=ROTOR_RINGS,
    )

    animating = True
    while animating:
        # background
        SCREEN.fill(BACKGROUND)

        # text inputs
        text = BOLD_FONT.render(INPUT, True, INPUT_COLOR)
        text_box = text.get_rect(center=(WIDTH / 2, MARGINS.top / 3))
        SCREEN.blit(text, text_box)

        # text output
        text = MONO_FONT.render(OUTPUT, True, INPUT_COLOR)
        text_box = text.get_rect(center=(WIDTH / 2, MARGINS.top / 3 + 25))
        SCREEN.blit(text, text_box)

        # draw encription machine
        draw(
            enigma=ENIGMA,
            encryption_path=ENCRYPTION_PATH,
            screen=SCREEN,
            width=WIDTH,
            height=HEIGHT,
            margins=MARGINS,
            gap=GAP_SIZE,
            font=BOLD_FONT,
        )

        pygame.display.flip()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                animating = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_DOWN:
                    rotor2.rotate(1)
                else:
                    key = event.unicode
                    if key.upper() in ALPHABET:
                        letter = key.upper()
                        INPUT = INPUT + letter
                        engima_result = ENIGMA.encrypt(letter)
                        ENCRYPTION_PATH = engima_result.path
                        OUTPUT = OUTPUT + engima_result.cipher


if __name__ == "__main__":
    main()
