from config.config import ALPHABET, PlugboardPair
from typing import List


class Plugboard:
    def __init__(self, plugboard_pairs: List[PlugboardPair]) -> None:
        self.plugboard_pairs = plugboard_pairs
        self._validate_pairs()
        self.left = ALPHABET
        self.right = ALPHABET
        for pair in plugboard_pairs:
            pos_a = self.left.find(pair.a)
            pos_b = self.left.find(pair.b)
            self.left = self.left[:pos_a] + pair.b + self.left[pos_a+1:]
            self.left = self.left[:pos_b] + pair.a + self.left[pos_b+1:]

    def forward(self, signal: int) -> int:
        letter = self.right[signal]
        return self.left.find(letter)

    def backward(self, signal: int) -> int:
        letter = self.left[signal]
        return self.right.find(letter)

    def _validate_pairs(self) -> None:
        vals = []
        for pair in self.plugboard_pairs:
            vals.append(pair.a)
            vals.append(pair.b)
        if len(vals) != len(set(vals)):
            raise ValueError(f'Duplicate value found in Plugboard pairs! {vals}')