# enigma
Ross' attempt to recreate the Enigma machine

Type on the keyboard and watch each letter's path through the plugboard, the
three rotors and the reflector, and back out to the lampboard.

```bash
pip install -r requirements.txt
python main.py      # the machine
python -m pytest    # the tests
```

The tests check the machine against known historical settings, including the
standard `AAAAA` → `BDZGO` check, the middle rotor's double step and a message
sent during Operation Barbarossa.

Rotor ring settings are zero-indexed: `RotorRings(0, 0, 0)` is A, A, A.
