# NVIDIA Nemotron Model Reasoning Challenge - Training Guide

This repository contains the deterministic solvers and the fine-tuning pipeline for the competition.

## 1. Prepare Data
Run the generation script to create the `training_data.jsonl` file with Chain-of-Thought reasoning.
```bash
python generate_training_data.py
```

## 2. Fine-tuning
Since the base model (Nemotron-3-Nano-30B) is large, you should run this on a GPU-enabled environment (e.g., Kaggle, Colab, or a local server with 24GB+ VRAM).

### Setup
```bash
pip install torch transformers peft trl bitsandbytes accelerate datasets
```

### Run Training
```bash
python train.py
```

## 3. Create Submission
After training, the adapter will be saved in `./nemotron-lora-adapter`. Zip the contents for submission:
```bash
cd nemotron-lora-adapter
zip -r ../submission.zip adapter_model.bin adapter_config.json
```

## Solvers Status
We have deterministic solvers for high-accuracy categories:
- **Gravity Physics**: 100% accuracy
- **Unit Conversion**: 100% accuracy
- **Numeral Conversion**: 100% accuracy
- **Bit Manipulation**: 11% (Linear GF2 solver)
- **Cipher**: 40% (Substitution + ROT)

The fine-tuning teaches the model to use these same logic patterns for the target input.
