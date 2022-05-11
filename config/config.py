import string
from dataclasses import dataclass

ALPHABET: str = string.ascii_uppercase


@dataclass
class Wiring:
    wiring: str

    def __post_init__(self):
        self.wiring = self.wiring.upper()
        if len(set(self.wiring)) != 26:
            raise ValueError(
                f"Wiring Specified is not correct. Check length or duplicate values! {self.wiring}"
            )

        if len(set(self.wiring).difference(ALPHABET)) != 0:
            raise ValueError(
                f"Wiring Specified is not correct. Check for non alphabetic values! {self.wiring}"
            )


@dataclass
class RotorKey:
    a: str
    b: str
    c: str

    def __post_init__(self):
        self.a = self.a.upper()
        self.b = self.b.upper()
        self.c = self.c.upper()

        if self.a not in ALPHABET:
            raise ValueError(f"{self.a} not alphabetic!")
        if self.b not in ALPHABET:
            raise ValueError(f"{self.b} not alphabetic!")
        if self.c not in ALPHABET:
            raise ValueError(f"{self.c} not alphabetic!")


@dataclass
class RotorRings:
    a: int
    b: int
    c: int

    def __post_init__(self):
        if 26 <= self.a >= 1:
            raise ValueError(f"{self.a} not between 1 and 26")
        if 26 <= self.b >= 1:
            raise ValueError(f"{self.b} not between 1 and 26")
        if 26 <= self.c >= 1:
            raise ValueError(f"{self.c} not between 1 and 26")


@dataclass
class PlugboardPair:
    a: str
    b: str

    def __post_init__(self):
        self.a = self.a.upper()
        self.b = self.b.upper()
        if self.a == self.b:
            raise ValueError(f"A cannot equal B in plugboard! {self.a} - {self.b}")
