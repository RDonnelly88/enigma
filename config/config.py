import string
from dataclasses import dataclass

ALPHABET: str = string.ascii_uppercase


@dataclass
class Wiring:
    wiring: str

    def __post_init__(self):
        self.wiring = self.wiring.upper()
        if len(set(self.wiring)) != 26:
            raise ValueError(f"Wiring Specified is not correct. Check length or duplicate values! {self.wiring}")

        if len(set(self.wiring).difference(ALPHABET)) != 0:
            raise ValueError(f"Wiring Specified is not correct. Check for non alphabetic values! {self.wiring}")


@dataclass
class RotorKey:
    a: str
    b: str
    c: str

    def __post_init__(self):
        self.a = self.a.upper()
        self.b = self.b.upper()
        self.c = self.c.upper()

        for letter in (self.a, self.b, self.c):
            if len(letter) != 1 or letter not in ALPHABET:
                raise ValueError(f"{letter} not a single letter!")


@dataclass
class RotorRings:
    # Zero-indexed: 0 is ring setting A (no offset), 25 is Z
    a: int
    b: int
    c: int

    def __post_init__(self):
        for ring in (self.a, self.b, self.c):
            if not 0 <= ring <= 25:
                raise ValueError(f"{ring} not between 0 (A) and 25 (Z)")


@dataclass
class PlugboardPair:
    a: str
    b: str

    def __post_init__(self):
        self.a = self.a.upper()
        self.b = self.b.upper()
        if len(self.a) != 1 or self.a not in ALPHABET:
            raise ValueError(f"{self.a} not a single letter!")
        if len(self.b) != 1 or self.b not in ALPHABET:
            raise ValueError(f"{self.b} not a single letter!")
        if self.a == self.b:
            raise ValueError(f"A cannot equal B in plugboard! {self.a} - {self.b}")
