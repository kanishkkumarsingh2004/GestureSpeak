"""
GestureSpeak PyTorch CUDA GPU Model Training Script
Alternative ultra-fast GPU training pipeline using PyTorch with CUDA acceleration on NVIDIA RTX 4070.
"""
import sys
import time
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from train.config import (
    SPLITS_DIR,
    TRAINED_MODEL_PATH,
    NUM_CLASSES,
    ALL_CLASSES,
    EPOCHS_HEAD,
    EPOCHS_FINETUNE,
    BATCH_SIZE,
    DENSE_UNITS,
    IMAGE_SIZE,
)

def main():
    print("=== GestureSpeak PyTorch CUDA GPU Training ===")
    
    try:
        import torch
        import torch.nn as nn
        from torchvision import models, transforms
        from torch.utils.data import Dataset, DataLoader
        from PIL import Image
        import pandas as pd
    except ImportError:
        print("[INFO] PyTorch / Torchvision not installed. Installing via uv...")
        sys.exit(1)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[DEVICE] Using Training Device: {device}")
    if device.type == "cuda":
        print(f"[GPU NAME] {torch.cuda.get_device_name(0)}")

    train_csv = SPLITS_DIR / "train.csv"
    val_csv = SPLITS_DIR / "val.csv"

    if not train_csv.exists():
        print("[ERROR] train.csv not found.")
        sys.exit(1)

    # PyTorch VGG16 Dataset
    class GestureDataset(Dataset):
        def __init__(self, csv_file, transform=None):
            self.df = pd.read_csv(csv_file)
            self.class_to_idx = {name: i for i, name in enumerate(ALL_CLASSES)}
            self.transform = transform

        def __len__(self):
            return len(self.df)

        def __getitem__(self, idx):
            row = self.df.iloc[idx]
            img = Image.open(row["path"]).convert("RGB")
            label = self.class_to_idx[row["label"]]
            if self.transform:
                img = self.transform(img)
            return img, label

    transform_train = transforms.Compose([
        transforms.Resize(IMAGE_SIZE),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.15, contrast=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    transform_val = transforms.Compose([
        transforms.Resize(IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    train_ds = GestureDataset(train_csv, transform=transform_train)
    val_ds = GestureDataset(val_csv, transform=transform_val)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=4, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=4, pin_memory=True)

    # Build VGG16 model
    model = models.vgg16(weights=models.VGG16_Weights.DEFAULT)
    for param in model.features.parameters():
        param.requires_grad = False  # Freeze backbone

    num_ftrs = model.classifier[6].in_features
    model.classifier[6] = nn.Sequential(
        nn.Linear(num_ftrs, DENSE_UNITS),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(DENSE_UNITS, NUM_CLASSES)
    )

    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.classifier.parameters(), lr=1e-3)

    print("\n--- Starting PyTorch CUDA GPU Head Training ---")
    for epoch in range(1, EPOCHS_HEAD + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        t0 = time.time()

        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data)
            total += labels.size(0)

        epoch_loss = running_loss / total
        epoch_acc = correct.double() / total
        t1 = time.time()

        print(f"Epoch {epoch}/{EPOCHS_HEAD} - {t1-t0:.2f}s - Loss: {epoch_loss:.4f} - Acc: {epoch_acc:.4f}")

    print("\n--- Starting PyTorch CUDA GPU Fine-Tuning ---")
    for param in model.features[24:].parameters():
        param.requires_grad = True

    optimizer_ft = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-5)

    for epoch in range(1, EPOCHS_FINETUNE + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        t0 = time.time()

        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer_ft.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer_ft.step()

            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data)
            total += labels.size(0)

        epoch_loss = running_loss / total
        epoch_acc = correct.double() / total
        t1 = time.time()

        print(f"Fine-Tune Epoch {epoch}/{EPOCHS_FINETUNE} - {t1-t0:.2f}s - Loss: {epoch_loss:.4f} - Acc: {epoch_acc:.4f}")

    print("\n=== PyTorch CUDA GPU Training Complete ===")

if __name__ == "__main__":
    main()
