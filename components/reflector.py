from config.config import ALPHABET, Wiring


class Reflector:
    def __init__(self, wiring: Wiring) -> None:
        self.left = ALPHABET
        self.right = wiring.wiring

    def reflect(self, signal: int) -> int:
        letter = self.right[signal]
        return self.left.find(letter)
