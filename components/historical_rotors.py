from components.rotor import Rotor
from config.config import Wiring

# Rotors turn as the machine is used, so each machine needs its own. These are
# functions rather than shared instances so that building a second machine, or
# putting the same rotor type in two slots, can't disturb the first.


def rotor_1() -> Rotor:
    return Rotor(Wiring("EKMFLGDQVZNTOWYHXUSPAIBRCJ"), "Q", "Rotor I")


def rotor_2() -> Rotor:
    return Rotor(Wiring("AJDKSIRUXBLHWTMCQGZNPYFVOE"), "E", "Rotor II")


def rotor_3() -> Rotor:
    return Rotor(Wiring("BDFHJLCPRTXVZNYEIWGAKMUSQO"), "V", "Rotor III")


def rotor_4() -> Rotor:
    return Rotor(Wiring("ESOVPZJAYQUIRHXLNFTGKDCMWB"), "J", "Rotor IV")


def rotor_5() -> Rotor:
    return Rotor(Wiring("VZBRGITYUPSDNHLXAWMJQOFECK"), "Z", "Rotor V")
