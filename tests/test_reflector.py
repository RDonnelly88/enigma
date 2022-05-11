from components.reflector import Reflector
from config.config import Wiring

WIRING = Wiring("EJMZALYXVBWFCRQUONTSPIKHGD")


def test_reflector_reflect():
    r = Reflector(wiring=WIRING)
    assert r.reflect(0) == 4 #A is D
    assert r.reflect(25) == 3 
