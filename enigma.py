from components.keyboard import Keyboard
from components.plugboard import Plugboard
from components.reflector import Reflector
from components.rotor import Rotor
from config.config import RotorKey, RotorRings
from dataclasses import dataclass
from typing import List


@dataclass
class EnigmaResult:
    cipher: str
    path: List[int]


class Enigma:
    def __init__(
        self,
        reflector: Reflector,
        rotor1: Rotor,
        rotor2: Rotor,
        rotor3: Rotor,
        plugboard: Plugboard,
        keyboard: Keyboard,
        rotor_key: RotorKey,
        rotor_rings: RotorRings,
    ):
        self.reflector = reflector
        self.rotor1 = rotor1
        self.rotor2 = rotor2
        self.rotor3 = rotor3
        self.plugboard = plugboard
        self.keyboard = keyboard
        self.rotor_key = rotor_key
        self.rotor_rings = rotor_rings

        self._initialise_enigma_machine()

    def _initialise_enigma_machine(self):
        self._set_rotor_rings()
        self._set_key()

    def _set_rotor_rings(self):
        self.rotor1.set_ring(self.rotor_rings.a)
        self.rotor2.set_ring(self.rotor_rings.b)
        self.rotor3.set_ring(self.rotor_rings.c)

    def _set_key(self):
        self.rotor1.rotate_to_letter(self.rotor_key.a)
        self.rotor2.rotate_to_letter(self.rotor_key.b)
        self.rotor3.rotate_to_letter(self.rotor_key.c)

    def encrypt(self, letter: str) -> EnigmaResult:
        if self.rotor2.get_value_left(0) == self.rotor2.notch and self.rotor3.get_value_left(0) == self.rotor3.notch:
            self.rotor1.rotate()
            self.rotor2.rotate()
            self.rotor3.rotate()
        elif self.rotor2.get_value_left(0) == self.rotor2.notch:
            self.rotor1.rotate()
            self.rotor2.rotate()
            self.rotor3.rotate()
        elif self.rotor3.get_value_left(0) == self.rotor3.notch:
            self.rotor2.rotate()
            self.rotor3.rotate()
        else:
            self.rotor3.rotate()

        signal = self.keyboard.forward(letter)
        path = [signal, signal]
        signal = self.plugboard.forward(signal)
        path.append(signal)
        path.append(signal)
        signal = self.rotor3.forward(signal)
        path.append(signal)
        path.append(signal)
        signal = self.rotor2.forward(signal)
        path.append(signal)
        path.append(signal)
        signal = self.rotor1.forward(signal)
        path.append(signal)
        path.append(signal)
        signal = self.reflector.reflect(signal)
        path.append(signal)
        path.append(signal)
        path.append(signal)
        signal = self.rotor1.backward(signal)
        path.append(signal)
        path.append(signal)
        signal = self.rotor2.backward(signal)
        path.append(signal)
        path.append(signal)
        signal = self.rotor3.backward(signal)
        path.append(signal)
        path.append(signal)
        signal = self.plugboard.backward(signal)
        path.append(signal)
        path.append(signal)
        return EnigmaResult(self.keyboard.backward(signal), path)
