import { ResearchPaper } from '../types/research';

export const SAMPLE_PAPERS: ResearchPaper[] = [
  {
    id: 'paper-vaswani-2017',
    title: 'Attention Is All You Need',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin',
    year: 2017,
    venue: 'Advances in Neural Information Processing Systems (NeurIPS 2017)',
    arxivId: '1706.03762',
    url: 'https://arxiv.org/abs/1706.03762',
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
    dateAdded: '2026-10-26',
    selected: true,
    content: `Abstract:
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.

Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature.

Methodology & Architecture:
Multi-Head Attention:
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) W^O
where head_i = Attention(Q W_i^Q, K W_i^K, V W_i^V)
Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k)) V

Computational Complexity:
Self-Attention per layer: O(n^2 * d) complexity, O(1) sequential operations, maximum path length O(1).
Recurrent layer: O(n * d^2) complexity, O(n) sequential operations, maximum path length O(n).
Convolutional layer: O(k * n * d^2) complexity, O(1) sequential operations, maximum path length O(log_k(n)).`,
  },
  {
    id: 'paper-gu-dao-2023',
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authors: 'Albert Gu, Tri Dao',
    year: 2023,
    venue: 'arXiv preprint',
    arxivId: '2312.00752',
    url: 'https://arxiv.org/abs/2312.00752',
    pdfUrl: 'https://arxiv.org/pdf/2312.00752.pdf',
    dateAdded: '2026-10-26',
    selected: true,
    content: `Abstract:
Foundation models, now powering most of the exciting applications in deep learning, are almost universally based on the Transformer architecture and its core attention module. Many subquadratic-time architectures such as linear attention, gated convolutions and recurrent models, and structured state space models (SSMs) have been developed to address Transformers' computational inefficiency on long sequences, but they have not performed as well as attention on important modalities such as language. We identify that a key weakness of such models is their inability to perform content-based reasoning, and make several improvements.

First, simply letting the SSM parameters be functions of the input addresses their weakness with discrete modalities, allowing the model to selectively propagate or forget information along the sequence dimension based on the current token. Second, even though this change precludes the use of efficient convolutions, we design a hardware-aware parallel algorithm in recurrent mode. We integrate these selective SSMs into a simplified end-to-end neural network architecture without attention or even MLP blocks (Mamba).

Mamba enjoys fast inference (5x higher throughput than Transformers) and linear scaling in sequence length, and its performance improves on real data up to million-length sequences. As a general sequence model backbone, Mamba achieves state-of-the-art performance across several modalities such as language, audio, and genomics. On language modeling, our Mamba-3B model outperforms Transformers of the same size and matches Transformers twice its size, both in pretraining and downstream evaluation.

Mathematical Formulation:
Continuous-time SSM:
h'(t) = A h(t) + B x(t)
y(t) = C h(t)

Discretization via Zero-Order Hold (ZOH):
A_bar = exp(Delta * A)
B_bar = (Delta * A)^(-1) (exp(Delta * A) - I) * Delta * B
h_t = A_bar h_{t-1} + B_bar x_t
y_t = C h_t

Selection Mechanism:
B_t = Linear_N(x_t), C_t = Linear_N(x_t), Delta_t = Softplus(Parameter + Linear_D(x_t))
Complexity: O(N) training and O(1) inference time per step with memory O(N * D).`,
  },
  {
    id: 'paper-dao-2023',
    title: 'FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning',
    authors: 'Tri Dao',
    year: 2023,
    venue: 'International Conference on Learning Representations (ICLR 2024)',
    arxivId: '2307.08691',
    url: 'https://arxiv.org/abs/2307.08691',
    pdfUrl: 'https://arxiv.org/pdf/2307.08691.pdf',
    dateAdded: '2026-10-26',
    selected: false,
    content: `Abstract:
Scaling sequence length is challenging for Transformers because the time and memory complexity of the self-attention mechanism is quadratic in sequence length. FlashAttention uses tiling to reduce memory reads/writes between GPU high bandwidth memory (HBM) and GPU on-chip SRAM, yielding 2-4x speedup over standard attention implementations.

However, FlashAttention is still not nearly as fast as optimized matrix-multiply (GEMM) operations, reaching only 25-40% of theoretical maximum FLOPs/s. We propose FlashAttention-2, which yields 2x speedup over FlashAttention, reaching up to 73% of theoretical max FLOPs/s on A100 GPUs. We achieve this by: (1) tweaking the algorithm to reduce non-matmul FLOPs (e.g., rescaling softmax operations at the end of the outer loop instead of each inner iteration), (2) parallelizing the attention computation over the sequence length dimension instead of only batch and head dimensions, and (3) partitioning the work between different thread blocks and warps within each block to reduce communication and shared memory reads/writes.

Complexity:
I/O complexity: O(N^2 * d^2 / M) where M is SRAM size.
Arithmetic intensity is dramatically improved by keeping intermediate softmax scales in registers.`,
  },
];
