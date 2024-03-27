#!/usr/bin/env python3
import torch
from PIL import Image
from diffusers import (
    AutoencoderKL,
    StableDiffusionControlNetPipeline,
    ControlNetModel,
    StableDiffusionControlNetImg2ImgPipeline,
    DPMSolverMultistepScheduler,
    EulerDiscreteScheduler,
)

def center_crop_resize(img, output_size=(512, 512)):
    width, height = img.size
    new_dimension = min(width, height)
    left = (width - new_dimension) / 2
    top = (height - new_dimension) / 2
    right = (width + new_dimension) / 2
    bottom = (height + new_dimension) / 2
    img = img.crop((left, top, right, bottom))
    img = img.resize(output_size)
    return img

def upscale(samples, upscale_method, scale_by):
    width = round(samples["images"].shape[3] * scale_by)
    height = round(samples["images"].shape[2] * scale_by)
    s = torch.nn.functional.interpolate(samples["images"], size=(height, width), mode=upscale_method)
    return s

def generate_image(control_image, prompt, negative_prompt, guidance_scale, controlnet_conditioning_scale, control_guidance_start, control_guidance_end, upscaler_strength, seed, sampler, progress_callback) -> Image:
    BASE_MODEL = "SG161222/Realistic_Vision_V5.1_noVAE"

    vae = AutoencoderKL.from_pretrained("stabilityai/sd-vae-ft-mse", torch_dtype=torch.float16)
    controlnet = ControlNetModel.from_pretrained("monster-labs/control_v1p_sd15_qrcode_monster", torch_dtype=torch.float16)
    main_pipe = StableDiffusionControlNetPipeline.from_pretrained(
        BASE_MODEL,
        controlnet=controlnet,
        vae=vae,
        safety_checker=None,
        torch_dtype=torch.float16,
    ).to("cuda")

    image_pipe = StableDiffusionControlNetImg2ImgPipeline(**main_pipe.components)

    SAMPLER_MAP = {
        "DPM++ Karras SDE": lambda config: DPMSolverMultistepScheduler.from_config(config, use_karras=True, algorithm_type="sde-dpmsolver++"),
        "Euler": lambda config: EulerDiscreteScheduler.from_config(config),
    }

    control_image_small = center_crop_resize(control_image)
    control_image_large = center_crop_resize(control_image, (1024, 1024))

    main_pipe.scheduler = SAMPLER_MAP[sampler](main_pipe.scheduler.config)
    generator = torch.Generator(device="cuda").manual_seed(seed)

    def first_callback(pipeline, i, t, callback_kwargs):
        progress_callback((i + 1) / 15 * 0.1)
        return callback_kwargs

    out = main_pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        image=control_image_small,
        guidance_scale=float(guidance_scale),
        controlnet_conditioning_scale=float(controlnet_conditioning_scale),
        generator=generator,
        control_guidance_start=float(control_guidance_start),
        control_guidance_end=float(control_guidance_end),
        num_inference_steps=15,
        output_type="latent",
        # roughly 10% of the job is this task
        callback_on_step_end=first_callback,
    )

    def second_callback(pipeline, i, t, callback_kwargs):
        progress_callback((i + 1) / 20 * 0.9 + 0.1)
        return callback_kwargs

    upscaled_latents = upscale(out, "nearest-exact", 2)
    out_image = image_pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        control_image=control_image_large,
        image=upscaled_latents,
        guidance_scale=float(guidance_scale),
        generator=generator,
        num_inference_steps=20,
        strength=upscaler_strength,
        control_guidance_start=float(control_guidance_start),
        control_guidance_end=float(control_guidance_end),
        controlnet_conditioning_scale=float(controlnet_conditioning_scale),
        # roughly 90% of the job is this task
        callback_on_step_end=second_callback,
    )

    # 100% finished
    progress_callback(1)

    return out_image["images"][0]
