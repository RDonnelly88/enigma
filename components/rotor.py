from config.config import ALPHABET, Wiring


class Rotor:
    def __init__(self, wiring: Wiring, notch: str):
        self.left_alphabet = ALPHABET
        self.right_alphabet = wiring.wiring
        self.notch = notch

    @property
    def left_first_value(self):
        return self.left_alphabet[0]

    @property
    def right_first_value(self):
        return self.right_alphabet[0]

    def forward(self, signal: int) -> int:
        letter = self.right_alphabet[signal]
        return self.left_alphabet.find(letter)

    def backward(self, signal: int) -> int:
        letter = self.left_alphabet[signal]
        return self.right_alphabet.find(letter)

    def show(self) -> None:
        print("Showing Rotor")
        print(self.left_alphabet)
        print(self.right_alphabet)

    def rotate(self, n=1) -> None:
        for _ in range(n):
            self.left_alphabet = self.left_alphabet[1:] + self.left_alphabet[0]
            self.right_alphabet = self.right_alphabet[1:] + self.right_alphabet[0]

    def rotate_to_letter(self, letter: str) -> None:
        n = ALPHABET.find(letter)
        self.rotate(n)
