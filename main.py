from components.keyboard import Keyboard
from components.historical_rotors import ROTOR_1, ROTOR_2, ROTOR_3, ROTOR_4, ROTOR_5
from components.historical_reflectors import REFLECTOR_A, REFLECTOR_B, REFLECTOR_C
from components.plugboard import Plugboard
from config.config import RotorKey, RotorRings, PlugboardPair

from enigma import Enigma


def main():
    PLUGBOARD = Plugboard(
        [PlugboardPair("A", "B"), PlugboardPair("C", "D"), PlugboardPair("E", "F")]
    )

    KEYBOARD = Keyboard()

    ROTOR_RINGS = RotorRings(1, 1, 2)
    ROTOR_KEY = RotorKey("C", "A", "T")
    ENIGMA = Enigma(
        reflector=REFLECTOR_B,
        rotor1=ROTOR_4,
        rotor2=ROTOR_2,
        rotor3=ROTOR_1,
        plugboard=PLUGBOARD,
        keyboard=KEYBOARD,
        rotor_key=ROTOR_KEY,
        rotor_rings=ROTOR_RINGS,
    )

    message = "ROSSISTHEBEST"
    cipher_text = ""
    for letter in message:
        cipher_text = cipher_text + ENIGMA.encrypt(letter)
    print(cipher_text)


if __name__ == "__main__":
    main()
