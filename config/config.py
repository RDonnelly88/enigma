import string
from dataclasses import dataclass

ALPHABET: str = string.ascii_uppercase


@dataclass
class Wiring:
    wiring: str

    def __post_init__(self):
        self.wiring = self.wiring.upper()
        if len(set(self.wiring)) != 26:
            raise ValueError(f'Wiring Specified is not correct. Check length or duplicate values! {self.wiring}')

        if len(set(self.wiring).difference(ALPHABET)) != 0:
            raise ValueError(f'Wiring Specified is not correct. Check for non alphabetic values! {self.wiring}')

@dataclass
class RotorKey:
    a: str
    b: str
    c: str

    def __post_init__(self):
        self.a = self.a.upper()
        self.b = self.b.upper()
        self.c = self.c.upper()

@dataclass
class PlugboardPair:
    a: str
    b: str

    def __post_init__(self):
        self.a = self.a.upper()
        self.b = self.b.upper()
        if self.a == self.b:
            raise ValueError(f"A cannot equal B in plugboard! {self.a} - {self.b}")
