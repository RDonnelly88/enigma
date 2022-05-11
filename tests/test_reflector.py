from components.reflector import Reflector
from components.reflectors import REFLECTOR_A, REFLECTOR_B, REFLECTOR_C

def test_reflectorA_reflect():
    r = REFLECTOR_A
    assert r.reflect(0) == 4
    assert r.reflect(25) == 3