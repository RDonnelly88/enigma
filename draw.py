import pygame
from enigma import Enigma
from config.pygame_config import WIDTH, Margin, PATH_COLORS, COMPONENT_NAME_COLOR
from typing import List
from config.config import ALPHABET


def draw(
    enigma: Enigma,
    encryption_path: List[int],
    screen: pygame.surface.Surface,
    width: int,
    height: int,
    margins: Margin,
    gap: int,
    font: pygame.font.Font,
):

    components = [enigma.reflector, enigma.rotor1, enigma.rotor2, enigma.rotor3, enigma.plugboard, enigma.keyboard]

    component_height = height - margins.top - margins.bottom
    component_width = (WIDTH - margins.left - margins.right - (len(components) - 1) * gap) / len(components)

    # draw path of encryption
    y = [margins.top + (signal + 1) * component_height / 27 for signal in encryption_path]

    x = [width - margins.right - component_width / 2]  # keyboard
    for i in [4, 3, 2, 1, 0]:  # forward pass
        x.append(margins.left + i * (component_width + gap) + component_width * 3 / 4)
        x.append(margins.left + i * (component_width + gap) + component_width * 1 / 4)
    x.append(margins.left + component_width * 3 / 4)  # reflector
    for i in [1, 2, 3, 4]:  # backward pass
        x.append(margins.left + i * (component_width + gap) + component_width * 1 / 4)
        x.append(margins.left + i * (component_width + gap) + component_width * 3 / 4)
    x.append(width - margins.right - component_width / 2)  # lampboard

    if len(encryption_path) > 0:
        for i in range(1, 21):
            if i < 10:
                color = PATH_COLORS.forward
            elif i < 12:
                color = PATH_COLORS.reflector
            else:
                color = PATH_COLORS.backward

            start = (x[i - 1], y[i - 1])
            end = (x[i], y[i])
            pygame.draw.line(screen, color, start, end, width=5)

        pygame.draw.circle(screen, "white", center=(x[0], y[0]), radius=15, width=2)
        pygame.draw.circle(screen, "yellow", center=(x[-1], y[-1]), radius=15, width=2)

    # draw enigma components
    x_position = margins.left
    for component in components:
        component.draw(screen, x_position, margins.top, component_width, component_height, font)
        x_position += component_width + gap

    # write component names
    y = margins.top * 0.8
    for i in range(len(components)):
        x = margins.left + component_width / 2 + i * (component_width + gap)

        title = font.render(components[i].name, True, COMPONENT_NAME_COLOR)

        text_box = title.get_rect(center=(x, y))
        screen.blit(title, text_box)

    # write configuration of machine
    y = margins.top * 0.25
    x = margins.left * 1.2
    text = font.render(f"Rotor Key = {enigma.rotor_key.a}, {enigma.rotor_key.b}, {enigma.rotor_key.c}", True, COMPONENT_NAME_COLOR)

    text_box = text.get_rect(center=(x, y))
    screen.blit(text, text_box)

    y = margins.top * 0.5
    x = margins.left * 1.2
    text = font.render(
        f"Rotor Rings = {ALPHABET[enigma.rotor_rings.a]}, {ALPHABET[enigma.rotor_rings.b]}, {ALPHABET[enigma.rotor_rings.c]}",
        True,
        COMPONENT_NAME_COLOR,
    )

    text_box = text.get_rect(center=(x, y))
    screen.blit(text, text_box)
