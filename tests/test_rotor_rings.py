from config.config import RotorRings
import pytest


def test_rotor_rings_accepts_a_to_z():
    RotorRings(0, 12, 25)


@pytest.mark.parametrize("ring", [-1, 26])
def test_rotor_rings_rejects_out_of_range(ring):
    with pytest.raises(ValueError):
        RotorRings(ring, 0, 0)
