from config.config import ALPHABET, PlugboardPair
from typing import List


class Plugboard:
    def __init__(self, pairs: List[PlugboardPair]):
        self.pairs = pairs
        self._validate_pairs()
        self.left_alphabet = ALPHABET
        self.right_alphabet = ALPHABET
        for pair in pairs:
            pos_a = self.left_alphabet.find(pair.a)
            pos_b = self.left_alphabet.find(pair.b)
            self.left_alphabet = (
                self.left_alphabet[:pos_a] + pair.b + self.left_alphabet[pos_a + 1 :]
            )
            self.left_alphabet = (
                self.left_alphabet[:pos_b] + pair.a + self.left_alphabet[pos_b + 1 :]
            )

    def forward(self, signal: int) -> int:
        letter = self.right_alphabet[signal]
        return self.left_alphabet.find(letter)

    def backward(self, signal: int) -> int:
        letter = self.left_alphabet[signal]
        return self.right_alphabet.find(letter)

    def _validate_pairs(self) -> None:
        # TODO
        pass
