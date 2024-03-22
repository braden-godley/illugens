from generator import generate_image
import redis
from PIL import Image
from io import BytesIO
import requests
import json
from random import randint
import datetime

# Max size is 1 MB for control images
max_size = 1024 * 1024 * 1

def handle_job(prompt: str, control_image_url: str):
    print("Downloading image...")
    control_image = download_image(control_image_url)
    print("Download complete.")

    print("Generating image...")
    output_image = generate_image(
        control_image=control_image,
        prompt=prompt,
        negative_prompt="low quality",
        guidance_scale=7.5,
        controlnet_conditioning_scale=0.8,
        control_guidance_start=0,
        control_guidance_end=1,
        upscaler_strength=1,
        sampler="Euler",
        seed=randint(1, 9999)
    )
    print("Finished generation.")

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

    output_image.save(f"/output/{timestamp}-generated.png")


def download_image(image_url: str) -> Image:
    response = requests.get(image_url, stream=True)

    if response.status_code != 200:
        raise Exception(f"Status {response.status_code} Cannot download image at URL: {image_url}")

    image_data = BytesIO()

    downloaded_size = 0
    chunk_size = 1024
    for chunk in response.iter_content(chunk_size=chunk_size):
        if chunk:
            image_data.write(chunk)
            downloaded_size += len(chunk)
            if downloaded_size > max_size:
                raise Exception(f"Maximum download size exceeded!")
    
    print(downloaded_size)

    return Image.open(image_data)


def main():
    r = redis.Redis(host="redis", port=6379, decode_responses=True)

    while True:
        message = r.brpop("job-queue")

        data = json.loads(message[1])

        prompt = data["prompt"]
        control_image_url = data["control_image_url"]

        print(data)

        try:
            handle_job(prompt, control_image_url)
        except Exception as e:
            print(f"Failed {str(e)}")


if __name__ == "__main__":
    print("Starting job runner...")
    main()
