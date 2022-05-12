from dataclasses import dataclass


@dataclass
class Margin:
    top: int
    bottom: int
    left: int
    right: int


@dataclass
class PathColors:
    forward: str
    backward: str
    reflector: str


WIDTH = 1600
HEIGHT = 900
BACKGROUND = "#754B4B"
CAPTION_COLOR = "white"
COMPONENT_BORDER_COLOR = "white"
COMPONENT_LETTERS_COLOR = "grey"
COMPONENT_BORDER_RADIUS = 15
COMPONENT_BORDER_WIDTH = 2
ROTOR_FIRST_LETTER_COLOR = "teal"
ROTOR_FIRST_LETTER_BORDER_RADIUS = 5
MARGINS = Margin(200, 100, 100, 100)
GAP_SIZE = 100
OUTPUT_COLOR = "white"
INPUT_COLOR = "white"
PATH_COLORS = PathColors("#43aa8b", "#f9c74f", "#e63946")
COMPONENT_NAME_COLOR = "white"
