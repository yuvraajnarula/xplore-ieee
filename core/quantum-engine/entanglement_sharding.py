"""
Entanglement sharding

Entanglement -> when 2 or more qubits are coexisting in quantum space such that
measuring one can instantly determine the other, no matter where they are.

Sharding -> splitting a big system into smaller shards for scaling.

Here we simulate splitting a global identity system into shards (nodes), while keeping
them quantum-entangled so they remain synchronized.

For example:
Node A and Node B each hold a copy of an identity credential.
Instead of relying on trustless replication, they are entangled —
if Node A is compromised or measured, Node B's state reflects it.
"""

from dataclasses import dataclass
from typing import List, Dict, Tuple

import cirq
import numpy as np


@dataclass
class Shard:
    """
    represents a single logical shard/node of the system 
    """
    id: str
    qubit: cirq.Qid


class EntangledShardsSystem:
    def __init__(self, num_shards: int = 3, basis: str = "Z", tamper: Tuple[int, ...] = (), depolarizing_prob: float = 0.0, repetitions: int = 1000):
        """
        Creates an entangled shard system using a GHZ state across `num_shards`.
        (we could use bellpair for 2 but ghz is a more generalized form)
        Args:
            num_shards (int): Number of shards (>=2).
            basis (str): Measurement basis ("Z" or "X").
            tamper (tuple): Indices of shards to tamper (measure early).
            depolarizing_prob (float): Noise probability per qubit.
            repetitions (int): Number of measurement repetitions.
        """
        self.num_shards = num_shards
        self.basis = basis.upper()
        self.tamper = tamper
        self.depolarizing_prob = depolarizing_prob
        self.repetitions = repetitions
        self.qubits = cirq.LineQubit.range(num_shards)
        self.shards: List[Shard] = [Shard(f"Node-{i}", qb) for i, qb in enumerate(self.qubits)]
        self.circuit = self._build_circuit()

    def _build_circuit(self) -> cirq.Circuit:
        """
        core: Entangle all qubits so they share a joint quantum state
        Start with all qubits in state |0⟩ (the default).

        Apply Hadamard (H) gate to the first qubit:
        Then, apply a CNOT gate from qubit 0 to every other qubit:
            If qubit 0 is 0 -> target remains unchanged.

            If qubit 0 is 1 -> target qubit flips.

        Result: This builds a GHZ state
        Meaning:
            Either all qubits are 0, or

            All are 1,

            But we don't know which until measurement.

            They are entangled — measuring one collapses all.
        """
        
        circuit = cirq.Circuit()
        q = self.qubits

        circuit.append(cirq.H(q[0]))
        for i in range(1, len(q)):
            circuit.append(cirq.CNOT(q[0], q[i]))

        for idx in self.tamper:
            circuit.append(cirq.measure(q[idx], key=f"tamper_{idx}"))
        if self.basis == "X":
            for qb in q:
                circuit.append(cirq.H(qb))

        circuit.append(cirq.measure(*q, key="final"))

        # Optional noise
        if self.depolarizing_prob > 0.0:
            noise_model = cirq.ConstantQubitNoiseModel(cirq.depolarize(self.depolarizing_prob))
            circuit = circuit.with_noise(noise_model)

        return circuit

    def run(self) -> Dict:
        simulator = cirq.DensityMatrixSimulator()
        result = simulator.run(self.circuit, repetitions=self.repetitions)
        bits = result.measurements["final"]
        hist = self._bitstring_histogram(bits)
        agreement_rate = self._agreement_rate(bits)
        pairwise_zz = self._pairwise_zz(bits)

        return {
            "num_shards": self.num_shards,
            "basis": self.basis,
            "tampered_nodes": list(self.tamper),
            "depolarizing_prob": self.depolarizing_prob,
            "repetitions": self.repetitions,
            "agreement_rate": agreement_rate,
            "bitstring_histogram": hist,
            "pairwise_zz": pairwise_zz,
        }

    @staticmethod
    def _bitstring_histogram(bits: np.ndarray) -> Dict[str, int]:
        counts = {}
        for row in bits:
            s = "".join(str(b) for b in row)
            counts[s] = counts.get(s, 0) + 1
        return counts

    @staticmethod
    def _agreement_rate(bits: np.ndarray) -> float:
        return float(np.mean(np.all(bits == bits[:, 0:1], axis=1)))

    @staticmethod
    def _pairwise_zz(bits: np.ndarray) -> Dict[str, float]:
        pm = 1 - 2 * bits  # 0 -> +1, 1 -> -1
        n = bits.shape[1]
        out = {}
        for i in range(n):
            for j in range(i + 1, n):
                key = f"{i}-{j}"
                out[key] = float(np.mean(pm[:, i] * pm[:, j]))
        return out

    def describe(self) -> None:
        """
        Prints the identity and assigned qubit for each shard.
        """
        for shard in self.shards:
            print(f"Shard {shard.id} holds qubit {shard.qubit}")



if __name__ == "__main__":
    system = EntangledShardsSystem(
        num_shards=3,
        basis="Z",
        tamper=(1,), 
        depolarizing_prob=0.02,
        repetitions=1000
    )
    system.describe()
    results = system.run()

    print("\n--- Measurement Report ---")
    for k, v in results.items():
        print(f"{k}: {v}")

