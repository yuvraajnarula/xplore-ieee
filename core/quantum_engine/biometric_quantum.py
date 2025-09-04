"""
This maps biometric features into quantum states that we can
later use for entanglement/sharding/verification.

this is a simulation on how the simulation of biometric features as
numeric vectors, normalize them, and encode them into qubits.

we'll try working around a statevector simulation
"""

import numpy as np 
import cirq 

class BiometricEncoder:
    def __init__(
            self,
            nqubits = 4
    ):
        self.nqubits = nqubits 
        self.dim = 2**nqubits
    
    def _normalize(
            self,
            vec
    ):
        arr = np.array(vec,dtype=np.float64)
        if np.allclose(arr, 0):
            raise ValueError("Biometric vector cannot be all zeros.")
        arr = arr / np.linalg.norm(arr)
        return arr

    def _pad_to_dim(
            self,
            arr
    ):
        if len(arr) >self.dim:
            arr = arr[:self.dim]
        
        elif len(arr) < self.dim :
            arr = np.pad(arr,(0,self.dim-len(arr)),'constant')
        
        return arr

    def encode(
            self,
            biometric_vec
    ):
        """
        Encode biometric vector into quantum state amplitudes.
        Returns: (statevector, circuit)
        """

        normed = self._normalize(biometric_vec)
        padded = self._pad_to_dim(normed)

        qubits = cirq.LineQubit.range(self.nqubits)

        circuit = cirq.Circuit()

        circuit.append(cirq.StatePreparationChannel(padded).on(*qubits))

        sim = cirq.Simulator()

        res = sim.simulate(circuit)

        statevector = res.final_state_vector 

        return statevector, circuit 
    

def fidelity(
        state_a,
        state_b
):
    """
    we're calculating the overlap between two quantum states.
    If two states are identical, the fidelity is 1.
    If they are completely different, the fidelity is 0
    """
    overlap = np.vdot(state_a,state_b)
    return float(np.abs(overlap)**2)