from config.config import ALPHABET, Wiring


class Reflector:
    def __init__(self, wiring: Wiring):
        self.left_alphabet = ALPHABET
        self.right_alphabet = wiring.wiring

    def reflect(self, signal: int) -> int:
        letter = self.right_alphabet[signal]
        return self.left_alphabet.find(letter)
