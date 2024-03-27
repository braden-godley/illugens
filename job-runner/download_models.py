import torch
from diffusers import (
    AutoencoderKL,
    ControlNetModel,
    StableDiffusionControlNetPipeline,
)

def download_models():
    BASE_MODEL = "SG161222/Realistic_Vision_V5.1_noVAE"

    vae = AutoencoderKL.from_pretrained("stabilityai/sd-vae-ft-mse", torch_dtype=torch.float16)
    controlnet = ControlNetModel.from_pretrained("monster-labs/control_v1p_sd15_qrcode_monster", torch_dtype=torch.float16)
    StableDiffusionControlNetPipeline.from_pretrained(
        BASE_MODEL,
        controlnet=controlnet,
        vae=vae,
        safety_checker=None,
        torch_dtype=torch.float16,
    )

if __name__ == "__main__":
    download_models()