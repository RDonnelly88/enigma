from components.keyboard import Keyboard
from components.rotors import ROTOR_1, ROTOR_2, ROTOR_3, ROTOR_4, ROTOR_5
from components.reflectors import REFLECTOR_A, REFLECTOR_B, REFLECTOR_C
from components.plugboards import PLUGBOARD

from enigma import Enigma


def main():
    ENIGMA = Enigma(
        reflector=REFLECTOR_A,
        rotor1=ROTOR_1,
        rotor2=ROTOR_2,
        rotor3=ROTOR_3,
        plugboard=PLUGBOARD,
        keyboard=Keyboard(),
    )
    print(ENIGMA.encrypt("A"))


if __name__ == "__main__":
    main()
