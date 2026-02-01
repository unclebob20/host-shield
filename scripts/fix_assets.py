from PIL import Image
import os

def fix_png_header(filepath):
    """
    Opens an image (even if it has wrong extension) and saves it as proper PNG.
    """
    print(f"Fixing {filepath}...")
    try:
        img = Image.open(filepath)
        img.save(filepath, "PNG")
        print(f"Saved {filepath} as proper PNG.")
    except Exception as e:
        print(f"Error fixing {filepath}: {e}")

def make_square_icon(filepath, target_size=(1024, 1024)):
    """
    Creates a square icon by centering the original image on a white (or transparent) background.
    """
    print(f"Squaring {filepath}...")
    try:
        img = Image.open(filepath).convert("RGBA")
        
        # Resize logic: Make the logo occupy ~75% of the canvas
        # Target inner size
        target_inner_size = int(target_size[0] * 0.75)
        
        # Calculate aspect ratio
        ratio = min(target_inner_size / img.width, target_inner_size / img.height)
        new_size = (int(img.width * ratio), int(img.height * ratio))
        
        # Resize image
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Create new square background
        new_img = Image.new("RGBA", target_size, (255, 255, 255, 0))
        
        # Calculate centering position
        left = (target_size[0] - new_size[0]) // 2
        top = (target_size[1] - new_size[1]) // 2
        
        # Paste original image
        new_img.paste(img, (left, top), img)
        
        new_img.save(filepath, "PNG")
        print(f"Saved squared {filepath} ({target_size[0]}x{target_size[1]}).")
    except Exception as e:
        print(f"Error squaring {filepath}: {e}")

# 1. Fix the marketing-bg.png which is actually a JPEG
fix_png_header("apps/mobile-app/assets/marketing-bg.png")

# 2. Fix the icons to be square
make_square_icon("apps/mobile-app/assets/icon.png")
make_square_icon("apps/mobile-app/assets/adaptive-icon.png")
make_square_icon("apps/mobile-app/assets/logo.png") # Do logo too just in case
