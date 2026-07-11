import random
DIFFICULTY = {
    "easy":   {"prime_min": 17,  "prime_max": 50,  "time_limit_sec": 300},
    "medium": {"prime_min": 50,  "prime_max": 150, "time_limit_sec": 180},
    "hard":   {"prime_min": 150, "prime_max": 255, "time_limit_sec": 120},
}

def is_prime(n: int) -> bool:
    """Return True if n is a prime number."""
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(n ** 0.5) + 1, 2):
        if n % i == 0:
            return False
    return True


def gcd(a: int, b: int) -> int:
    """Return the greatest common divisor of a and b (Euclidean algorithm)."""
    while b:
        a, b = b, a % b
    return a


def modinv(e: int, phi: int) -> int | None:
    """
    Return the modular multiplicative inverse of e mod phi using the
    extended Euclidean algorithm, or None if no inverse exists.
    """
    old_r, r = e, phi
    old_s, s = 1, 0

    while r != 0:
        quotient = old_r // r
        old_r, r = r, old_r - quotient * r
        old_s, s = s, old_s - quotient * s

    if old_r != 1:        
        return None

    return old_s % phi    


def valid_e_options(phi: int) -> list[int]:
    """
    Return up to 10 valid public-key exponents e where:
      - 1 < e < phi
      - gcd(e, phi) == 1
    Common small primes are tried first so the list is stable and easy
    to work with in the game UI.
    """
    candidates = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
    options = [e for e in candidates if e < phi and gcd(e, phi) == 1]

    if len(options) < 3:
        e = candidates[-1] + 2 if candidates else 3
        while len(options) < 10 and e < phi:
            if gcd(e, phi) == 1:
                options.append(e)
            e += 2

    return options[:10]


def encrypt(message: str, e: int, n: int) -> list[int]:
    """
    Encrypt a plaintext string character by character.
    Each character c is encrypted as: pow(ord(c), e, n)
    Uses Python's built-in 3-argument pow() for efficient modular exponentiation.
    """
    return [pow(ord(ch), e, n) for ch in message]


def decrypt(cipher: list[int], d: int, n: int) -> str:
    """
    Decrypt a list of cipher integers back to a string.
    Each value v is decrypted as: chr(pow(v, d, n))
    """
    return "".join(chr(pow(v, d, n)) for v in cipher)


def random_candidates(difficulty: str) -> list[int]:
    """
    Generate the candidate number pool shown to the player in Stage 1.

    Rules:
    - Contains a mix of real primes (in the difficulty range) and composite
      numbers (decoys), shuffled.
    - Guarantees at least 4 primes so the player always has valid choices.
    - Guarantees at least one valid (p, q) pair where n = p*q > 255.
    - Pool size: 10 numbers total.
    """
    cfg = DIFFICULTY[difficulty]
    lo, hi = cfg["prime_min"], cfg["prime_max"]

    all_primes = [n for n in range(lo, hi + 1) if is_prime(n)]

    chosen_primes = random.sample(all_primes, min(4, len(all_primes)))

    chosen_primes.sort()
    while len(chosen_primes) >= 2 and chosen_primes[0] * chosen_primes[1] <= 255:
        chosen_primes.pop(0)
        extras = [p for p in all_primes if p not in chosen_primes]
        if extras:
            chosen_primes.append(random.choice(extras))
        chosen_primes.sort()

    composites = [n for n in range(lo, hi + 1) if not is_prime(n)]
    num_decoys = 10 - len(chosen_primes)
    chosen_decoys = random.sample(composites, min(num_decoys, len(composites)))

    pool = chosen_primes + chosen_decoys
    random.shuffle(pool)
    return pool