from config.config import Wiring
from components.reflector import Reflector

# Reflectors keep no state, so sharing one instance between machines is safe
REFLECTOR_A = Reflector(Wiring("EJMZALYXVBWFCRQUONTSPIKHGD"), "Reflector A")
REFLECTOR_B = Reflector(Wiring("YRUHQSLDPXNGOKMIEBFZCWVJAT"), "Reflector B")
REFLECTOR_C = Reflector(Wiring("FVPJIAOYEDRZXWGCTKUQSBNMHL"), "Reflector C")

# The thin reflectors of the four-rotor naval M4
REFLECTOR_B_THIN = Reflector(Wiring("ENKQAUYWJICOPBLMDXZVFTHRGS"), "Reflector B Thin")
REFLECTOR_C_THIN = Reflector(Wiring("RDOBJNTKVEHMLFCWZAXGYIPSUQ"), "Reflector C Thin")
