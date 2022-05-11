from components.keyboard import Keyboard
from components.plugboard import Plugboard
from components.reflector import Reflector
from components.rotor import Rotor


class Enigma:
    def __init__(
        self,
        reflector: Reflector,
        rotor1: Rotor,
        rotor2: Rotor,
        rotor3: Rotor,
        plugboard: Plugboard,
        keyboard: Keyboard,
        key: 
    ):
        self.reflector = reflector
        self.rotor1 = rotor1
        self.rotor2 = rotor2
        self.rotor3 = rotor3
        self.plugboard = plugboard
        self.keyboard = keyboard
    
    def set_key(self, key: str):


    def encrypt(self, letter: str) -> str:
        if self.rotor2.left_first_value == self.rotor2.notch and self.rotor3.left_first_value == self.rotor3.notch:
            self.rotor1.rotate()
            self.rotor2.rotate()
            self.rotor3.rotate()
        elif self.rotor2.left_first_value == self.rotor2.notch:
            self.rotor1.rotate()
            self.rotor2.rotate()
            self.rotor3.rotate()
        elif self.rotor3.left_first_value == self.rotor3.notch:
            self.rotor2.rotate()
            self.rotor3.rotate()
        else:
            self.rotor3.rotate()

        signal = self.keyboard.forward(letter)
        signal = self.plugboard.forward(signal)
        signal = self.rotor3.forward(signal)
        signal = self.rotor2.forward(signal)
        signal = self.rotor1.forward(signal)
        signal = self.reflector.reflect(signal)
        signal = self.rotor1.backward(signal)
        signal = self.rotor2.backward(signal)
        signal = self.rotor3.backward(signal)
        signal = self.plugboard.backward(signal)
        return self.keyboard.backward(signal)
