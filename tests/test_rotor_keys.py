from config.config import RotorKey
import pytest


def test_rotor_throws_error_if_non_alphabetic():
    with pytest.raises(ValueError):
        RotorKey("A", "A", "_")
