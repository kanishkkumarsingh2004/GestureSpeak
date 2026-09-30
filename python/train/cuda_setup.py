"""
GestureSpeak CUDA Setup Helper
Ensures NVIDIA CUDA 12 shared libraries in .venv are registered before TensorFlow initializes.
"""
import os
import sys
from pathlib import Path

def setup_cuda_environment():
    """Configures LD_LIBRARY_PATH so TensorFlow detects pip-installed nvidia CUDA libraries."""
    venv_dir = Path(sys.prefix)
    site_packages = venv_dir / "lib" / f"python{sys.version_info.major}.{sys.version_info.minor}" / "site-packages"
    nvidia_dir = site_packages / "nvidia"
    
    if nvidia_dir.exists():
        cuda_lib_paths = [str(p / "lib") for p in nvidia_dir.glob("*") if (p / "lib").exists()]
        if cuda_lib_paths:
            existing_ld = os.environ.get("LD_LIBRARY_PATH", "")
            new_ld = ":".join(cuda_lib_paths + ([existing_ld] if existing_ld else []))
            os.environ["LD_LIBRARY_PATH"] = new_ld
            # Set TF CUDA flags
            os.environ["TF_ENABLE_ONEDNN_OPTS"] = "1"
            print(f"[CUDA Setup] Appended {len(cuda_lib_paths)} NVIDIA CUDA library paths to LD_LIBRARY_PATH.")

setup_cuda_environment()
