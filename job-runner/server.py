from generator import generate_image
import redis
from PIL import Image
from io import BytesIO
import requests
import json
from random import randint
import hmac
from hashlib import sha256
import base64
from os import getenv

# Max size is 1 MB for control images
MAX_SIZE = 1024 * 1024 * 1
SIGNATURE_KEY = getenv("JOB_RUNNER_SIGNATURE_KEY") or ""
APP_URL = getenv("APP_URL") or ""
REDIS_URL = getenv("REDIS_URL") or ""

def handle_job(request_id: str, prompt: str, control_image_data: BytesIO, progress_callback):
    print("Prompt:", prompt)
    print("Downloading image...")
    control_image = Image.open(control_image_data)
    control_image.save("/output/control.png")
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
        seed=randint(1, 9999),
        progress_callback=progress_callback
    )
    print("Finished generation.")

    image_bytes = BytesIO()   
    output_image.save(image_bytes, format="png")

    signature = generate_hmac(image_bytes, SIGNATURE_KEY)
    print(f"Generated signature: {signature}")

    print("Sending to API...")
    url = f"{APP_URL}/api/generation-completed?requestId={request_id}&signature={signature}"
    image_bytes.seek(0)
    response = requests.post(
        url=url,
        data=image_bytes
    )

    if response.status_code == 200:
        print("Sent output image to API")
    else:
        print(f"Failed to send! Status: {response.status_code}")
        print(response.content)


def generate_hmac(data_buffer: BytesIO, signature_key: str) -> str:
    # Create an HMAC object with the signature key
    hmac_obj = hmac.new(signature_key.encode(), digestmod=sha256)
    
    # Move the buffer position to the beginning
    data_buffer.seek(0)
    
    # Update the HMAC object with the data from the buffer
    hmac_obj.update(data_buffer.read())
    
    # Generate the HMAC digest
    hmac_digest = hmac_obj.hexdigest()
    
    return hmac_digest


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
            if downloaded_size > MAX_SIZE:
                raise Exception(f"Maximum download size exceeded!")
    
    print(downloaded_size)

    return Image.open(image_data)


def main():
    r = redis.Redis.from_url(url=REDIS_URL, decode_responses=True)

    while True:
        message = r.brpop("job-queue")

        data = json.loads(message[1])

        request_id = data["request_id"]
        prompt = data["prompt"]
        control_image_data = BytesIO()
        control_image_data.write(base64.b64decode(str.encode(data["control_image_data"])))

        def progress_callback(progress):
            key = f"job_progress:{request_id}"
            data = {
                "type": "progress",
                "progress": progress,
            }
            r.publish(key, json.dumps(data))

        try:
            handle_job(request_id, prompt, control_image_data, progress_callback)
        except Exception as e:
            print(f"Failed {str(e)}")


if __name__ == "__main__":
    print("Starting job runner...")
    main()
