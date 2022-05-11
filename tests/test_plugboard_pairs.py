from config.config import PlugboardPair
import pytest


def test_plugboard_pair_duplicate_value():
    with pytest.raises(ValueError):
        PlugboardPair("A", "A")
