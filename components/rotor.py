from config.config import ALPHABET, Wiring


class Rotor:
    def __init__(self, wiring: Wiring, notch: str) -> None:
        self.left = ALPHABET
        self.right = wiring.wiring
        self.notch = notch

    @property
    def get_first_value_left(self):
        return self.left[0]

    @property
    def right_first_value(self):
        return self.right[0]

    def forward(self, signal: int) -> int:
        letter = self.right[signal]
        return self.left.find(letter)

    def backward(self, signal: int) -> int:
        letter = self.left[signal]
        return self.right.find(letter)

    def show(self) -> None:
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
        self.rotate(n)

    def set_ring(self, ring: int) -> None:
        # rotate backwards first (index =1)
        self.rotate(num_of_rotations=ring - 1, rotate_forward=False)

        # adjust turnover notch in relation to the wiring
        n_notch = ALPHABET.find(self.notch)
        self.notch = ALPHABET[(n_notch - ring) % 26]
